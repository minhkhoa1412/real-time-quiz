import { Module } from '@nestjs/common';
import { PrismaService } from '~/prisma/services/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
