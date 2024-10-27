import { Module } from '@nestjs/common';
import { PrismaModule } from '~/prisma/prisma.module';
import { QuizService } from './services/quiz.service';
import { QuizGateway } from './gateway/quiz.gateway';
import { QuizController } from './controllers/quiz.controller';
import { RedisModule } from '~/redis/redis.module';
import { LeaderboardModule } from '~/leaderboard/leaderboard.module';

@Module({
  imports: [PrismaModule, RedisModule, LeaderboardModule],
  controllers: [QuizController],
  providers: [QuizService, QuizGateway],
  exports: [QuizService],
})
export class QuizModule {}
