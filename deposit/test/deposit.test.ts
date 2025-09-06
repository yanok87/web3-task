// test/deposit.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { foundry } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  deposit,
  InvalidAmountError,
  NotEnoughBalanceError,
  MissingAllowanceError,
  AmountExceedsMaxDepositError,
} from "../index";
import { loadMockContracts } from "./contracts";

/** --------- anvil lifecycle ---------- */
let anvil: ReturnType<typeof Bun.spawn> | null = null;

async function waitForRpc(url = "http://127.0.0.1:8545", timeoutMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_chainId",
          params: [],
        }),
      });
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("anvil RPC did not come up in time");
}

beforeAll(async () => {
  anvil = Bun.spawn(["anvil", "-p", "8545"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await waitForRpc();
});

afterAll(() => {
  try {
    anvil?.kill();
  } catch {}
});

/** --------- viem setup ---------- */
const account = privateKeyToAccount(
  // anvil/Foundry well-known test PK #0
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const publicClient = createPublicClient({
  chain: foundry,
  transport: http("http://127.0.0.1:8545"),
});

const walletClient = createWalletClient({
  account,
  chain: foundry,
  transport: http("http://127.0.0.1:8545"),
});

/** helpers */
async function deploy(abi: any, bytecode: `0x${string}`, args: any[] = []) {
  // deploy by sending raw tx (viem wallet action deployContract is available but this is concise)
  const hash = await walletClient.sendTransaction({
    account,
    data: (bytecode +
      (args.length
        ? encodeConstructorArgs(abi, args).slice(2)
        : "")) as `0x${string}`,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("no contract address");
  return receipt.contractAddress as `0x${string}`;
}

function encodeConstructorArgs(abi: any[], args: any[]): `0x${string}` {
  const ctor = abi.find((x) => x.type === "constructor") || { inputs: [] };
  if ((ctor.inputs as any[]).length === 0) return "0x";
  // light ABI encoder (via viem’s built-in)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { encodeAbiParameters } = require("viem");
  return encodeAbiParameters(ctor.inputs, args);
}

/** --------- Deploy once and reuse across tests ---------- */
let tokenAddr: `0x${string}`;
let vaultAddr: `0x${string}`;
let compiled: ReturnType<typeof loadMockContracts>;

beforeAll(async () => {
  compiled = loadMockContracts();

  tokenAddr = await deploy(
    compiled.erc20Abi,
    compiled.erc20Bytecode as `0x${string}`,
    []
  );
  vaultAddr = await deploy(
    compiled.vaultAbi,
    compiled.vaultBytecode as `0x${string}`,
    [tokenAddr]
  );

  // mint tokens to our test wallet
  await walletClient.writeContract({
    address: tokenAddr,
    abi: compiled.erc20Abi,
    functionName: "mint",
    args: [account.address, 1_000_000n * 10n ** 18n],
    account,
  });

  // default maxDeposit is unlimited (uint256 max)
});

describe("deposit()", () => {
  test("throws InvalidAmountError when amount is zero or negative", async () => {
    // Test zero amount
    await expect(
      deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: 0n,
      })
    ).rejects.toBeInstanceOf(InvalidAmountError);

    // Test negative amount
    await expect(
      deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: -1n,
      })
    ).rejects.toBeInstanceOf(InvalidAmountError);

    // Test large negative amount
    await expect(
      deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: -1000000n,
      })
    ).rejects.toBeInstanceOf(InvalidAmountError);
  });

  test("InvalidAmountError has correct error message", async () => {
    try {
      await deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: 0n,
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidAmountError);
      expect((error as InvalidAmountError).message).toBe(
        "Amount must be greater than zero"
      );
    }
  });

  test("throws NotEnoughBalanceError when balance < amount", async () => {
    // Set maxDeposit low enough but keep allowance large so balance check is the failing gate.
    // First, set allowance huge:
    await walletClient.writeContract({
      address: tokenAddr,
      abi: compiled.erc20Abi,
      functionName: "approve",
      args: [vaultAddr, 1000n],
      account,
    });

    // Set vault maxDeposit to very high so it won't be the reason for failure
    await walletClient.writeContract({
      address: vaultAddr,
      abi: compiled.vaultAbi,
      functionName: "setMaxDeposit",
      args: [1_000_000n * 10n ** 18n],
      account,
    });

    // Temporarily drain almost all tokens from wallet to enforce low balance
    await walletClient.writeContract({
      address: tokenAddr,
      abi: compiled.erc20Abi,
      functionName: "transfer",
      args: [
        "0x000000000000000000000000000000000000dEaD",
        999_999n * 10n ** 18n,
      ],
      account,
    });

    await expect(
      deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: 2_000n * 10n ** 18n, // bigger than leftover balance
      })
    ).rejects.toBeInstanceOf(NotEnoughBalanceError);
  });

  test("throws MissingAllowanceError when allowance < amount", async () => {
    // Make sure we have balance again
    await walletClient.writeContract({
      address: tokenAddr,
      abi: compiled.erc20Abi,
      functionName: "mint",
      args: [account.address, 10_000n * 10n ** 18n],
      account,
    });

    // Set a small allowance
    await walletClient.writeContract({
      address: tokenAddr,
      abi: compiled.erc20Abi,
      functionName: "approve",
      args: [vaultAddr, 1n], // tiny allowance
      account,
    });

    await expect(
      deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: 2n,
      })
    ).rejects.toBeInstanceOf(MissingAllowanceError);
  });

  test("throws AmountExceedsMaxDepositError when amount > maxDeposit(receiver)", async () => {
    // Give huge allowance so maxDeposit gate is the only failing one
    await walletClient.writeContract({
      address: tokenAddr,
      abi: compiled.erc20Abi,
      functionName: "approve",
      args: [vaultAddr, 1_000_000n * 10n ** 18n],
      account,
    });

    // Limit maxDeposit to 100
    await walletClient.writeContract({
      address: vaultAddr,
      abi: compiled.vaultAbi,
      functionName: "setMaxDeposit",
      args: [100n],
      account,
    });

    await expect(
      deposit(publicClient, {
        wallet: account.address,
        vault: vaultAddr,
        amount: 101n,
      })
    ).rejects.toBeInstanceOf(AmountExceedsMaxDepositError);
  });

  test("happy path: builds a valid tx to deposit into the vault", async () => {
    // Restore a generous maxDeposit
    await walletClient.writeContract({
      address: vaultAddr,
      abi: compiled.vaultAbi,
      functionName: "setMaxDeposit",
      args: [1_000_000n * 10n ** 18n],
      account,
    });

    // Ensure allowance & balance are both sufficient
    await walletClient.writeContract({
      address: tokenAddr,
      abi: compiled.erc20Abi,
      functionName: "approve",
      args: [vaultAddr, 1_000_000n * 10n ** 18n],
      account,
    });

    const amount = 12345n;

    const tx = await deposit(publicClient, {
      wallet: account.address,
      vault: vaultAddr,
      amount,
    });

    expect(tx.from).toBe(account.address);
    expect(tx.to).toBe(vaultAddr);
    expect(tx.value).toBe(0n);
    expect(tx.data.startsWith("0x")).toBeTrue();
    expect(tx.gas > 0n).toBeTrue();

    // Optional: verify calldata encodes deposit(uint256,address)
    const erc4626Abi = parseAbi([
      "function deposit(uint256 assets, address receiver) returns (uint256)",
    ]);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { encodeFunctionData } = require("viem");
    const expectedData: `0x${string}` = encodeFunctionData({
      abi: erc4626Abi,
      functionName: "deposit",
      args: [amount, account.address],
    });
    expect(tx.data).toBe(expectedData);
  });
});
