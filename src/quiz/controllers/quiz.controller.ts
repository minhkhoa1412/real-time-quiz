import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { AuthGuard } from '~/common/auth.guard';
import { QuizGateway } from '../gateway/quiz.gateway';

@Controller('quiz')
export class QuizController {
  constructor(
    private quizService: QuizService,
    private quizGateway: QuizGateway,
  ) {}

  @Get()
  async getAllQuizzes() {
    return await this.quizService.getAllQuizzes();
  }

  @UseGuards(AuthGuard)
  @Get(':quizId')
  async getQuizById(@Param('quizId') quizId: string) {
    return await this.quizService.getQuizById(quizId);
  }

  @UseGuards(AuthGuard)
  @Post(':quizId/join')
  async joinQuiz(@Param('quizId') quizId: string, @Req() req: any) {
    const userId = req.user.id;
    return await this.quizService.addUserToQuiz(userId, quizId);
  }

  @UseGuards(AuthGuard)
  @Post(':quizId/complete')
  async completeQuiz(@Param('quizId') quizId: string, @Req() req: any) {
    const userId = req.user.id;
    return await this.quizService.completeTheQuiz(userId, quizId);
  }

  @UseGuards(AuthGuard)
  @Post(':quizId/score')
  async updateScore(
    @Param('quizId') quizId: string,
    @Body('score') score: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    this.quizGateway.updateScore(userId, quizId, score);
    return {
      message: 'Score updated',
    };
  }
}
