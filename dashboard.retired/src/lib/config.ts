export const config = {
  gateway: {
    url: process.env.GATEWAY_URL || "http://localhost:18789",
    healthEndpoint: "/health",
  },
  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
  },
  sqlite: {
    dbPath:
      process.env.TWOBRAIN_SQLITE_PATH ||
      "/Volumes/BotCentral/Users/milo/repos/2Brain/data/brain.sqlite",
  },
  twobrain: {
    root:
      process.env.TWOBRAIN_ROOT ||
      "/Volumes/BotCentral/Users/milo/repos/2Brain",
  },
  openclawMaster: {
    root:
      process.env.OPENCLAW_MASTER_ROOT ||
      "/Volumes/BotCentral/Users/milo/repos/OpenClawMaster",
  },
  disk: {
    volume: "/Volumes/BotCentral",
  },
} as const;
