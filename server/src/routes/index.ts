import { getHealthController, getStatusController } from "../controllers/health.controller";
import { 
  createUserController, 
  listUsersController, 
  loginController, 
  searchPatientsController, 
  listCriticalPatientsController, 
  connectUserController 
} from "../controllers/user.controller";
import { syncChatHistory, getChatHistory, getChatSessions } from "../controllers/chat.history.controller";
import { getReport, logMedicine } from "../controllers/report.controller";

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

  // ─── CORS preflight ────────────────────────────────────────────
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Helper to add CORS headers to any response
  const corsify = (response: Response): Response => {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };

  if (method === "GET" && url.pathname === "/") {
    return corsify(getStatusController());
  }

  if (method === "GET" && url.pathname === "/health") {
    return corsify(getHealthController());
  }

  if (method === "POST" && url.pathname === "/api/login") {
    return corsify(await loginController(request));
  }

  if (method === "POST" && url.pathname === "/api/users") {
    return corsify(await createUserController(request));
  }

  if (method === "GET" && url.pathname === "/api/users") {
    return corsify(await listUsersController());
  }

  if (method === "GET" && url.pathname === "/api/patients") {
    return corsify(await searchPatientsController(request));
  }

  if (method === "GET" && url.pathname === "/api/patients/critical") {
    return corsify(await listCriticalPatientsController());
  }

  if (method === "POST" && url.pathname === "/api/connect/user") {
    return corsify(await connectUserController(request));
  }

  if (method === "POST" && url.pathname === "/api/history/sync") {
    return corsify(await syncChatHistory(request));
  }

  if (method === "GET" && url.pathname === "/api/history") {
    return corsify(await getChatHistory(request));
  }

  if (method === "GET" && url.pathname === "/api/history/sessions") {
    return corsify(await getChatSessions(request));
  }

  // ─── Report endpoints ──────────────────────────────────────────
  if (method === "GET" && url.pathname === "/api/reports") {
    return corsify(await getReport(request));
  }

  if (method === "POST" && url.pathname === "/api/medicine/log") {
    return corsify(await logMedicine(request));
  }

  return corsify(
    jsonResponse(
      {
        error: "Not Found",
        path: url.pathname,
      },
      404,
    ),
  );
}
