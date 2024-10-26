import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { QuizService } from '../services/quiz.service';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Redis } from 'ioredis';
import { REDIS_PUBLISHER_CLIENT, REDIS_SUBSCRIBER_CLIENT } from '~/ultilies/constants';

@WebSocketGateway({
  namespace: 'quiz',
  cors: {
    origin: '*',
  },
})
export class QuizGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly quizService: QuizService,
    @Inject(REDIS_SUBSCRIBER_CLIENT) private readonly redisSubscriber: Redis,
    @Inject(REDIS_PUBLISHER_CLIENT) private readonly redisPublisher: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.redisSubscriber.subscribe('scoreUpdated', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    this.redisSubscriber.on('message', (channel, message) => {
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
    @ConnectedSocket() client: Socket,
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

  async updateScore(userId: string, quizId: string, score: number) {
    await this.redisPublisher.set(`score:${userId}:${quizId}`, score);
    this.redisPublisher.publish(
      'scoreUpdated',
      JSON.stringify({ userId, quizId, score }),
    );
  }
}
