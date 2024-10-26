import { Module } from '@nestjs/common';
import { PrismaModule } from '~/prisma/prisma.module';
import { QuizService } from './services/quiz.service';
import { QuizGateway } from './gateway/quiz.gateway';
import { QuizController } from './controllers/quiz.controller';
import { RedisModule } from '~/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [QuizController],
  providers: [QuizService, QuizGateway],
  exports: [QuizService],
})
export class QuizModule {}
