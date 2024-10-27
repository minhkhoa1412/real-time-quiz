import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LeaderboardEntry } from '../services/leaderboard.service';

@WebSocketGateway({
  namespace: 'leaderboard',
  cors: {
    origin: '*',
  },
})
export class LeaderboardGateway {
  @WebSocketServer()
  server: Server;

  emitLeaderboardUpdate(update: LeaderboardEntry) {
    console.log('ahihihh fire', update);
    this.server.emit('leaderboardUpdate', update);
  }
}
