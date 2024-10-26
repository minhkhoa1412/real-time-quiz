import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuizService } from '../services/quiz.service';
import { REDIS_SUBSCRIBER_CLIENT } from '~/ultilies/constants';
import Redis from 'ioredis';

@Injectable()
export class QuizListener {
  constructor(
    private readonly quizService: QuizService,
    @Inject(REDIS_SUBSCRIBER_CLIENT) private readonly redis: Redis,
  ) {}

  @OnEvent('score.updated')
  async handleScoreUpdatedEvent(payload: {
    userId: string;
    quizId: string;
    score: number;
  }) {
    const { userId, quizId, score } = payload;
    try {
      await this.quizService.updateScore(userId, quizId, score);
      await this.redis.del(`score:${userId}:${quizId}`);
    } catch (error: any) {
      console.error("Failed to save score to DB:", error);
    }
  }
}
