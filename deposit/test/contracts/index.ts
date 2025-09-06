import { readFileSync } from "fs";
import { join } from "path";
import solc from "solc";

export function loadMockContracts() {
  const contractsDir = __dirname;

  const sources = {
    "MockERC20.sol": {
      content: readFileSync(join(contractsDir, "MockERC20.sol"), "utf-8"),
    },
    "Mock4626Vault.sol": {
      content: readFileSync(join(contractsDir, "Mock4626Vault.sol"), "utf-8"),
    },
  };

  const input = {
    language: "Solidity",
    sources,
    settings: {
      optimizer: { enabled: false, runs: 200 },
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode.object"] },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors?.length) {
    const fatal = output.errors.find((e: any) => e.severity === "error");
    if (fatal)
      throw new Error(fatal.formattedMessage || "solc compilation failed");
  }

  const erc20 = output.contracts["MockERC20.sol"]["MockERC20"];
  const vault = output.contracts["Mock4626Vault.sol"]["Mock4626Vault"];

  return {
    erc20Abi: erc20.abi,
    erc20Bytecode: `0x${erc20.evm.bytecode.object}`,
    vaultAbi: vault.abi,
    vaultBytecode: `0x${vault.evm.bytecode.object}`,
  };
}
