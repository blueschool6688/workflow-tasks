import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/stores/authStore';

// Attach Pusher to window so Laravel Echo can find it
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

export type SocketConnectionStatus = 'connected' | 'connecting' | 'unavailable' | 'failed' | 'disconnected';

let echoInstance: Echo<'reverb'> | null = null;
let currentConnectionStatus: SocketConnectionStatus = 'disconnected';
const statusListeners = new Set<(status: SocketConnectionStatus) => void>();

export function getEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = useAuthStore.getState().token;
  if (!token) {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
      updateStatus('disconnected');
    }
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'tasks-app-key';
  const wsHost = process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname || '127.0.0.1';
  const wsPort = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);
  const wssPort = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);
  const forceTLS = process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const authEndpoint = apiBaseUrl.replace('/api/v1', '') + '/broadcasting/auth';

  try {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost,
      wsPort,
      wssPort,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // Monitor connection states
    const pusherClient = echoInstance.connector?.pusher;
    if (pusherClient?.connection) {
      pusherClient.connection.bind('state_change', (states: { current: SocketConnectionStatus }) => {
        updateStatus(states.current);
      });
      pusherClient.connection.bind('error', () => {
        updateStatus('unavailable');
      });
    }
  } catch (error) {
    console.warn('[EchoService] Failed to initialize Echo client:', error);
    updateStatus('unavailable');
  }

  return echoInstance;
}

function updateStatus(status: SocketConnectionStatus) {
  currentConnectionStatus = status;
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch {
      // Ignore
    }
  });
}

export function subscribeSocketStatus(listener: (status: SocketConnectionStatus) => void): () => void {
  statusListeners.add(listener);
  listener(currentConnectionStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

export function getSocketStatus(): SocketConnectionStatus {
  return currentConnectionStatus;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    updateStatus('disconnected');
  }
}
