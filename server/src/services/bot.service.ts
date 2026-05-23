/**
 * Notifies a bot of an update.
 * In a production environment, this might use WebSockets or a message queue.
 * For this implementation, we assume the bot has a reachable IP or we use a proxy.
 * If the bot is not reachable, it will pull updates during its next sync.
 */
export async function notifyBotOfUpdate(botId: string, data: any) {
  const botUrl = process.env[`BOT_URL_${botId}`] || `http://localhost:5000`;
  
  try {
    const response = await fetch(`${botUrl}/api/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bot-Api-Key': process.env.BOT_API_KEY || '',
      },
      body: JSON.stringify(data),
      // Fetch timeout implementation for Node/Bun
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      console.log(`[Server] Notified bot ${botId} of update.`);
    } else {
      console.log(`[Server] Bot ${botId} returned status ${response.status}.`);
    }
  } catch (error: any) {
    // If bot is offline, it's okay - it will sync later.
    console.log(`[Server] Bot ${botId} is offline or unreachable. Update queued for next sync.`);
  }
}
