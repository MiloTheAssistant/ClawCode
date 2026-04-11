import { config } from "./config";

export async function getOllamaStatus() {
  try {
    const res = await fetch(`${config.ollama.url}/api/tags`, {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    return {
      running: true,
      modelCount: data.models?.length ?? 0,
      models: data.models ?? [],
    };
  } catch {
    return { running: false, modelCount: 0, models: [] };
  }
}

export async function getRunningModels() {
  try {
    const res = await fetch(`${config.ollama.url}/api/ps`, {
      next: { revalidate: 10 },
    });
    return await res.json();
  } catch {
    return { models: [] };
  }
}
