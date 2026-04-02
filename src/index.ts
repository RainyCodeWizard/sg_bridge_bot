import type { Env } from './types';

export { GameRoom } from './game-room';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/create' && request.method === 'POST') {
      const roomCode = generateRoomCode();
      const stub = env.GAME_ROOM.getByName(roomCode);
      await stub.fetch(
        new Request('https://internal/create', {
          method: 'POST',
          body: JSON.stringify({ roomCode }),
        }),
      );
      return Response.json({ roomCode });
    }

    if (url.pathname === '/api/ws') {
      const roomCode = url.searchParams.get('room');
      if (!roomCode) {
        return new Response('Missing room code', { status: 400 });
      }
      const stub = env.GAME_ROOM.getByName(roomCode);
      return stub.fetch(request);
    }

    return new Response(null, { status: 404 });
  },
};
