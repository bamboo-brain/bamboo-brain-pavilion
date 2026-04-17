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

  if (!res.ok) {
    const errorText = await res.text();
    console.error('SignalR negotiate failed:', res.status, errorText);
    throw new Error(`Failed to negotiate SignalR connection: ${res.status} ${res.statusText}`);
  }

  let negotiateData;
  try {
    negotiateData = (await res.json()) as NegotiateResponse;
  } catch (parseError) {
    console.error('Failed to parse negotiate response:', parseError);
    throw new Error('Invalid negotiate response format');
  }

  const { url, accessToken: signalRToken } = negotiateData;

  if (!url || !signalRToken) {
    console.error('Missing SignalR connection info:', { url: !!url, token: !!signalRToken });
    throw new Error('Negotiate response missing url or accessToken');
  }

  console.log('SignalR connecting to:', url.split('?')[0]); // log URL without token

  // Step 2 — build connection pointing at Azure SignalR
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => signalRToken,
      skipNegotiation: false, // allow negotiation to work properly
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling, // fallback to long-polling
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // retry intervals
    .configureLogging(signalR.LogLevel.Information) // more verbose for debugging
    .build();

  return connection;
}
