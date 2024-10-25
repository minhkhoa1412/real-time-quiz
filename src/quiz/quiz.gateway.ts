import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizService } from './services/quiz.service';

@WebSocketGateway({ namespace: 'quiz' })
export class QuizGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly quizService: QuizService) {}

  @SubscribeMessage('joinQuiz')
  async handleJoinQuiz(
    @MessageBody() data: { userId: string; quizId: string },
    client: Socket,
  ) {
    const { userId, quizId } = data;

    const participation = await this.quizService.findParticipation(
      userId,
      quizId,
    );
    if (!participation) {
      client.emit('error', 'Quiz participation not found');
      return;
    }

    client.join(quizId);
    client.emit('joinedQuiz', participation);
  }

  // This method is called when a user submits a quiz
  async updateScore(userId: string, quizId: string, score: number) {
    await this.quizService.updateScore(userId, quizId, score);
    this.server.to(quizId).emit('scoreUpdated', { userId, quizId, score });
  }
}
