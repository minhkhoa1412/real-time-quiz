import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QuizListener } from './quiz/listeners/quiz.listener';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService, QuizListener],
})
export class AppModule {}
