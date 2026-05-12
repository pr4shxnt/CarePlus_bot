import ChatHistory from "../models/chat.history.model";


export async function syncChatHistory(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { userId: string; botId: string; history: any[] };
    const { userId, botId, history } = body;

    if (!userId || !botId || !Array.isArray(history)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const formattedHistory = history.map((item: any) => ({
      userId,
      botId,
      sessionId: item.sessionId,
      role: item.role,
      content: item.content,
      timestamp: item.timestamp,
    }));

    await ChatHistory.insertMany(formattedHistory);

    return Response.json({ success: true, count: formattedHistory.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function getChatSessions(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const sessions = await ChatHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$sessionId",
          startTime: { $min: "$timestamp" },
          endTime: { $max: "$timestamp" },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { startTime: -1 } },
    ]);

    return Response.json(sessions);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function getChatHistory(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const sessionId = url.searchParams.get("sessionId");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const role = url.searchParams.get("role");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    let query: any = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }
    if (role) {
      query.role = role;
    }

    const history = await ChatHistory.find(query)
      // .sort({  }) // Newest first for better retrieval
      .limit(limit);

    // Return newest first, but the app might prefer chronological. 
    // We'll return what the query gave us.
    return Response.json(history);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
