import { describe, expect, test, mock } from "bun:test";
import { handleRequest } from "../src/index";

// Mock the ChatHistory model to avoid DB timeout
mock.module("../src/models/chat.history.model", () => {
  return {
    default: {
      find: () => ({
        sort: () => ({
          limit: () => Promise.resolve([
            { role: "user", content: "test", timestamp: new Date() }
          ])
        })
      }),
      insertMany: () => Promise.resolve([])
    }
  };
});

describe("History JSON Retrieval", () => {
  test("GET /api/history returns valid JSON array", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/api/history?userId=mock-user"));
    
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    
    const body:any = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].content).toBe("test");
  });
});
