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
import { LeaderboardService } from '~/leaderboard/services/leaderboard.service';
import { LeaderboardGateway } from '~/leaderboard/gateway/leaderboard.gateway';

@Controller('quiz')
export class QuizController {
  constructor(
    private quizService: QuizService,
    private quizGateway: QuizGateway,
    private leaderboardService: LeaderboardService,
    private leaderboardGateway: LeaderboardGateway,
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
    const participant = await this.quizService.addUserToQuiz(userId, quizId);
    this.quizGateway.updateParticipant(userId, quizId, true);
    return participant;
  }

  @UseGuards(AuthGuard)
  @Post(':quizId/complete')
  async completeQuiz(@Param('quizId') quizId: string, @Req() req: any) {
    const userId = req.user.id;
    const participant = await this.quizService.completeTheQuiz(userId, quizId);
    this.quizGateway.updateParticipant(userId, quizId, false);
    return participant;
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
    const userRankInfo = await this.leaderboardService.getUserRank(
      userId,
      quizId,
      score,
    );
    this.leaderboardGateway.emitLeaderboardUpdate(userRankInfo);
    return {
      message: 'Score updated',
    };
  }
}
