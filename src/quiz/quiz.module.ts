import { Module } from '@nestjs/common';
import { PrismaModule } from '~/prisma/prisma.module';
import { QuizService } from './services/quiz.service';
import { QuizGateway } from './quiz.gateway';
import { QuizController } from './controllers/quiz.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController],
  providers: [QuizService, QuizGateway],
})
export class QuizModule {}
