import { connectToDatabase } from "../config/database";
import { type CreateUserInput, mapUserDocument, UserModel } from "../models/user.model";

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "x-powered-by": "bun",
    },
  });
}

export function parseCreateUserPayload(payload: unknown): CreateUserInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a valid object");
  }

  const maybeUser = payload as Record<string, unknown>;
  const name = maybeUser.name;
  const email = maybeUser.email;

  if (typeof name !== "string" || name.trim().length < 2) {
    throw new Error("Field 'name' must be at least 2 characters");
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new Error("Field 'email' must be a valid email");
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
  };
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error("Request body must be valid JSON");
  }
}

export async function loginController(request: Request): Promise<Response> {
  try {
    const { email } = (await request.json()) as { email: string };
    const isDatabaseReady = await connectToDatabase();
    if (!isDatabaseReady) return jsonResponse({ error: "DB error" }, 503);

    const user = await UserModel.findOne({ email });
    if (!user) return jsonResponse({ error: "User not found" }, 404);

    return jsonResponse({ data: mapUserDocument(user as never) });
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function searchPatientsController(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const isDatabaseReady = await connectToDatabase();
    if (!isDatabaseReady) return jsonResponse({ error: "DB error" }, 503);

    const patients = await UserModel.find({
      role: "patient",
      name: { $regex: query, $options: "i" },
    }).limit(20).lean();

    return jsonResponse({ data: patients.map((p: any) => mapUserDocument(p)) });
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function listCriticalPatientsController(): Promise<Response> {
  try {
    const isDatabaseReady = await connectToDatabase();
    if (!isDatabaseReady) return jsonResponse({ error: "DB error" }, 503);

    const patients = await UserModel.find({
      role: "patient",
      status: "critical",
    }).lean();

    return jsonResponse({ data: patients.map((p: any) => mapUserDocument(p)) });
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function connectUserController(request: Request): Promise<Response> {
  try {
    const { guardianId, patientId } = (await request.json()) as { guardianId: string; patientId: string };
    const isDatabaseReady = await connectToDatabase();
    if (!isDatabaseReady) return jsonResponse({ error: "DB error" }, 503);

    await UserModel.findByIdAndUpdate(patientId, { guardianId });
    return jsonResponse({ success: true });
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function createUserController(request: Request): Promise<Response> {
  let payload: any;

  try {
    payload = await parseJsonBody(request);
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }

  try {
    const isDatabaseReady = await connectToDatabase();
    if (!isDatabaseReady) {
      return jsonResponse(
        {
          error: "Database is not configured. Set MONGO_URI environment variable.",
        },
        503,
      );
    }

    const userDocument = await UserModel.create(payload);

    return jsonResponse(
      {
        message: "User created",
        data: mapUserDocument(userDocument as never),
      },
      201,
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return jsonResponse({ error: "Email already exists" }, 409);
    }

    return jsonResponse({ error: "Failed to create user" }, 500);
  }
}

export async function listUsersController(): Promise<Response> {
  try {
    const isDatabaseReady = await connectToDatabase();
    if (!isDatabaseReady) {
      return jsonResponse(
        {
          error: "Database is not configured. Set MONGO_URI environment variable.",
        },
        503,
      );
    }

    const userDocuments = await UserModel.find().sort({ createdAt: -1 }).limit(50).lean();

    return jsonResponse({
      data: userDocuments.map((userDocument: any) => mapUserDocument(userDocument as never)),
    });
  } catch {
    return jsonResponse({ error: "Failed to fetch users" }, 500);
  }
}
