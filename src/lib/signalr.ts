import * as signalR from '@microsoft/signalr';
import type { NegotiateResponse } from '@/types/notification';

export async function createSignalRConnection(
  accessToken: string
): Promise<signalR.HubConnection> {
  // Step 1 — get connection info from API proxy (not direct backend)
  const res = await fetch('/api/notifications/negotiate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Failed to negotiate SignalR connection');

  const { url, accessToken: signalRToken } = (await res.json()) as NegotiateResponse;

  // Step 2 — build connection pointing at Azure SignalR
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => signalRToken,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // retry intervals
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}
