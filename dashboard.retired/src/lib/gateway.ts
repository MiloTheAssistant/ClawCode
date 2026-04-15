import { config } from "./config";

export async function getGatewayHealth() {
  try {
    const res = await fetch(
      `${config.gateway.url}${config.gateway.healthEndpoint}`,
      { next: { revalidate: 10 } }
    );
    return await res.json();
  } catch {
    return { ok: false, status: "unreachable" };
  }
}

export async function getAgentStatus() {
  try {
    const res = await fetch(`${config.gateway.url}/api/agents`, {
      next: { revalidate: 10 },
    });
    return await res.json();
  } catch {
    return [];
  }
}
