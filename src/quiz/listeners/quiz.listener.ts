import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuizService } from '../services/quiz.service';

@Injectable()
export class QuizListener {
  constructor(private readonly quizService: QuizService) {}

  @OnEvent('score.updated')
  async handleScoreUpdatedEvent(payload: {
    userId: string;
    quizId: string;
    score: number;
  }) {
    const { userId, quizId, score } = payload;
    await this.quizService.updateScore(userId, quizId, score);
  }
}
