import { getHealthController, getStatusController } from "../controllers/health.controller";
import { createUserController, listUsersController } from "../controllers/user.controller";
import { syncChatHistory, getChatHistory, getChatSessions } from "../controllers/chat.history.controller";

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "x-powered-by": "bun",
    },
  });
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (method === "GET" && url.pathname === "/") {
    return getStatusController();
  }

  if (method === "GET" && url.pathname === "/health") {
    return getHealthController();
  }

  if (method === "POST" && url.pathname === "/api/users") {
    return createUserController(request);
  }

  if (method === "GET" && url.pathname === "/api/users") {
    return listUsersController();
  }

  if (method === "POST" && url.pathname === "/api/history/sync") {
    return syncChatHistory(request);
  }

  if (method === "GET" && url.pathname === "/api/history") {
    return getChatHistory(request);
  }

  if (method === "GET" && url.pathname === "/api/history/sessions") {
    return getChatSessions(request);
  }

  return jsonResponse(
    {
      error: "Not Found",
      path: url.pathname,
    },
    404,
  );
}
