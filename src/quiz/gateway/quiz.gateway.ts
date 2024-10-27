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
import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
} from '~/ultilies/constants';
import { QuizParticipantStatus } from '@prisma/client';

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

    this.redisSubscriber.subscribe('participantsUpdated', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    this.redisSubscriber.on('message', async (channel, message) => {
      if (channel === 'scoreUpdated') {
        const { userId, quizId, score } = JSON.parse(message);
        this.server.to(quizId).emit('scoreUpdated', { userId, quizId, score });
        this.eventEmitter.emit('score.updated', { userId, quizId, score });
      }
      if (channel === 'participantsUpdated') {
        const { userId, quizId, isJoining } = JSON.parse(message);
        const participants = await this.quizService.getParticipant(
          userId,
          quizId,
        );
        this.server.to(quizId).emit('participantsUpdated', {
          isJoining,
          participants,
        });
      }
    });
  }

  @SubscribeMessage('joinQuizRoom')
  async handleJoinQuiz(
    @MessageBody() data: { userId: string; quizId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { quizId } = data;

    const activeParticipations = await this.quizService.getParticipants(
      quizId,
      QuizParticipantStatus.ACTIVE,
    );

    client.join(quizId);
    client.emit('joinQuizRoom', activeParticipations);
  }

  async updateScore(userId: string, quizId: string, score: number) {
    await this.redisPublisher.set(`score:${userId}:${quizId}`, score);
    this.redisPublisher.publish(
      'scoreUpdated',
      JSON.stringify({ userId, quizId, score }),
    );
  }

  async updateParticipant(userId: string, quizId: string, isJoining = true) {
    this.redisPublisher.publish(
      'participantsUpdated',
      JSON.stringify({ userId, quizId, isJoining }),
    );
  }
}
