import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/stores/authStore';

// Attach Pusher to window so Laravel Echo can find it
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<'reverb'> | null = null;

export function getEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = useAuthStore.getState().token;
  if (!token) {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
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
  } catch (error) {
    console.warn('[EchoService] Failed to initialize Echo client:', error);
  }

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
