import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { QuizService } from '../services/quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Get()
  async getAllQuizzes() {
    return await this.quizService.getAllQuizzes();
  }

  @Get(':quizId')
  async getQuizById(@Param('quizId') quizId: string) {
    return await this.quizService.getQuizById(quizId);
  }

  @Post(':quizId/join')
  async joinQuiz(
    @Param('quizId') quizId: string,
    @Body('userId') userId: string,
  ) {
    return await this.quizService.addUserToQuiz(userId, quizId);
  }

  @Post(':quizId/score')
  async updateScore(
    @Param('quizId') quizId: string,
    @Body('userId') userId: string,
    @Body('score') score: number,
  ) {
    return await this.quizService.updateScore(userId, quizId, score);
  }
}
