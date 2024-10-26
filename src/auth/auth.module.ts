import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaModule } from '~/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      global: true,
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
