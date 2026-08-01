import { z } from "zod";

const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();
const optionalSecret = z.string().trim().min(1).optional().or(z.literal(""));

export const clientEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_AI_ENABLED: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_SOLANA_CLUSTER: z.enum(["devnet", "mainnet-beta", "custom"]).default("devnet"),
  NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SOLANA_CUSTOM_RPC_URL: optionalUrl,
  NEXT_PUBLIC_POWERCHAIN_PROGRAM_ID_DEVNET: z.string().trim().optional(),
  NEXT_PUBLIC_POWERCHAIN_PROGRAM_ID_MAINNET: z.string().trim().optional(),
  NEXT_PUBLIC_SUI_NETWORK: z.enum(["devnet", "testnet", "mainnet", "custom"]).default("testnet"),
  NEXT_PUBLIC_SUI_DEVNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SUI_TESTNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SUI_MAINNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SUI_CUSTOM_RPC_URL: optionalUrl
});

export const serverEnvironmentSchema = clientEnvironmentSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AI_PROVIDER: z.enum(["mock", "openai", "azure", "anthropic", "google", "custom"]).default("mock"),
  AI_API_KEY: optionalSecret,
  AI_BASE_URL: optionalUrl,
  SOLANA_DEVNET_RPC_URL: optionalUrl,
  SOLANA_MAINNET_RPC_URL: optionalUrl,
  SOLANA_CUSTOM_RPC_URL: optionalUrl,
  HELIUS_API_KEY: optionalSecret,
  HELIUS_DEVNET_RPC_URL: optionalUrl,
  HELIUS_MAINNET_RPC_URL: optionalUrl,
  SUI_DEVNET_RPC_URL: optionalUrl,
  SUI_TESTNET_RPC_URL: optionalUrl,
  SUI_MAINNET_RPC_URL: optionalUrl,
  SUI_CUSTOM_RPC_URL: optionalUrl,
  MAP_PROVIDER: z.enum(["internal", "mapbox", "google"]).default("internal"),
  MAPBOX_ACCESS_TOKEN: optionalSecret,
  GOOGLE_MAPS_API_KEY: optionalSecret,
  MAIL_API_URL: optionalUrl,
  MAIL_API_KEY: optionalSecret,
  MAIL_FROM: z.string().email().optional(),
  CETUS_NETWORK: z.enum(["mainnet", "testnet"]).default("mainnet"),
  CETUS_FULLNODE_URL: optionalUrl,
  CORS_ALLOWED_ORIGINS: z.string().trim().optional(),
  DATABASE_URL: z.string().trim().optional(),
  SENTRY_DSN: optionalUrl
});

export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
