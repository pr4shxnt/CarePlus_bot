'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ChatMessage {
  _id: string;
  role: string;
  content: string;
  timestamp: string;
  botId: string;
}

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || 'web-user';
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/history?userId=${userId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 dark:bg-zinc-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-zinc-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chat History</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">User ID: {userId}</p>
        </div>
        
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500">No history found.</p>
          ) : (
            history.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[10px] mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
