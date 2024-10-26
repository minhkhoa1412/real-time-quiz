import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizService } from '../services/quiz.service';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '~/ultilies/constants';

@WebSocketGateway({ namespace: 'quiz' })
export class QuizGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly quizService: QuizService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.redis.subscribe('scoreUpdated', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    this.redis.on('message', (channel, message) => {
      if (channel === 'scoreUpdated') {
        const { userId, quizId, score } = JSON.parse(message);
        this.server.to(quizId).emit('scoreUpdated', { userId, quizId, score });
        this.eventEmitter.emit('score.updated', { userId, quizId, score });
      }
    });
  }

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
    await this.redis.set(`score:${userId}:${quizId}`, score);
    this.redis.publish(
      'scoreUpdated',
      JSON.stringify({ userId, quizId, score }),
    );
  }
}
