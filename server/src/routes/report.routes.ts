import { getReport, logMedicine } from "../controllers/report.controller";

/**
 * Handle all /api/reports and /api/medicine/* routes.
 * Returns a Response if matched, or null if no route matched.
 */
export async function handleReportRoutes(
  method: string,
  pathname: string,
  request: Request,
): Promise<Response | null> {
  // GET /api/reports?userId=xxx&period=daily|weekly|monthly
  if (method === "GET" && pathname === "/api/reports") {
    return await getReport(request);
  }

  // POST /api/medicine/log
  if (method === "POST" && pathname === "/api/medicine/log") {
    return await logMedicine(request);
  }

  return null;
}
