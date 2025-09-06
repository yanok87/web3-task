// index.ts
import type { PublicClient } from "viem";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "./abi/erc20";
import { erc4626Abi } from "./abi/erc4626";

/** ---- Types from the prompt ---- */
export type DepositParams = {
  wallet: `0x${string}`;
  vault: `0x${string}`;
  amount: bigint;
};

type Transaction = {
  data: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  gas: bigint;
};

export class NotEnoughBalanceError extends Error {
  constructor() {
    super("Not enough balance");
  }
}

export class MissingAllowanceError extends Error {
  constructor() {
    super("Not enough allowance");
  }
}

export class AmountExceedsMaxDepositError extends Error {
  constructor() {
    super("Amount exceeds max deposit");
  }
}

/**
 * Deposit an amount of an asset into a given vault.
 *
 * @throws {NotEnoughBalanceError} if the wallet does not have enough balance to deposit the amount
 * @throws {MissingAllowanceError} if the wallet does not have enough allowance to deposit the amount
 * @throws {AmountExceedsMaxDepositError} if the amount exceeds the max deposit
 */
export async function deposit(
  client: PublicClient,
  { wallet, vault, amount }: DepositParams
): Promise<Transaction> {
  if (amount <= 0n) {
    // Treat zero/negative as "nothing to do" — but build a tx anyway would be weird, so fail fast.
    throw new AmountExceedsMaxDepositError();
  }

  // 1) discover the vault's underlying ERC-20 asset
  const asset = (await client.readContract({
    address: vault,
    abi: erc4626Abi,
    functionName: "asset",
  })) as `0x${string}`;

  // 2) sanity checks: balance, allowance, maxDeposit
  const [balance, allowance, maxDeposit] = (await Promise.all([
    client.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [wallet],
    }),
    client.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: "allowance",
      args: [wallet, vault],
    }),
    client.readContract({
      address: vault,
      abi: erc4626Abi,
      functionName: "maxDeposit",
      args: [wallet], // receiver = wallet (typical UX)
    }),
  ])) as [bigint, bigint, bigint];

  if (balance < amount) throw new NotEnoughBalanceError();
  if (allowance < amount) throw new MissingAllowanceError();
  if (maxDeposit < amount) throw new AmountExceedsMaxDepositError();

  // 3) build the transaction via simulate (gets calldata + gas safely)
  const { request } = await client.simulateContract({
    address: vault,
    abi: erc4626Abi,
    functionName: "deposit",
    args: [amount, wallet],
    account: wallet,
  });

  // 4) encode the function call data
  const data = encodeFunctionData({
    abi: erc4626Abi,
    functionName: "deposit",
    args: [amount, wallet],
  });

  // 5) ensure we have a gas value (fallback to estimate if simulate didn't include it)
  const gas =
    (request.gas as bigint | undefined) ??
    (await client.estimateGas({
      account: wallet,
      to: vault,
      data,
      value: (request.value ?? 0n) as bigint,
    }));

  return {
    data,
    from: wallet,
    to: vault,
    value: ((request.value as bigint | undefined) ?? 0n) as bigint,
    gas,
  };
}
