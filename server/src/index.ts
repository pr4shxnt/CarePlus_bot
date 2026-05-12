import { handleRequest } from "./routes";
import { connectToDatabase } from "./config/database";

const APP_NAME = "Careplus API";
const DEFAULT_PORT = 3000;

export function resolvePort(portValue: string | undefined): number {
  const parsedPort = Number.parseInt(portValue ?? "", 10);

  if (Number.isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
    return DEFAULT_PORT;
  }

  return parsedPort;
}

export { handleRequest };

export async function startServer(port = resolvePort(Bun.env.PORT)) {
  const connected = await connectToDatabase();
  if (connected) {
    console.log("✅ Connected to MongoDB");
  } else {
    console.warn("⚠️ Database URI not found. Running without persistence.");
  }

	return Bun.serve({
		port,
		fetch: handleRequest,
	});
}

if (import.meta.main) {
	startServer().then((server) => {
	  console.log(`🚀 ${APP_NAME} listening on http://localhost:${server.port}`);
  });
}
