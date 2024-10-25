import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '~/prisma/services/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prismaService: PrismaService) {}

  async getAllQuizzes() {
    return this.prismaService.quiz.findMany();
  }

  async getQuizById(quizId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
      include: { participants: true },
    });

    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }

    return quiz;
  }

  async addUserToQuiz(userId: string, quizId: string) {
    const isJoined = await this.isJoinedParticipation(userId, quizId);

    if (isJoined) {
      throw new HttpException(
        'User already joined the quiz',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prismaService.quizParticipation.create({
      data: {
        user: { connect: { id: userId } },
        quiz: { connect: { id: quizId } },
      },
    });
  }

  async updateScore(userId: string, quizId: string, score: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });
    if (!user || !quiz) {
      throw new HttpException('User or Quiz not found', HttpStatus.NOT_FOUND);
    }

    const participation = await this.prismaService.quizParticipation.updateMany(
      {
        where: {
          userId,
          quizId,
        },
        data: {
          score,
        },
      },
    );

    return { message: 'Score updated successfully', participation };
  }

  async isJoinedParticipation(userId: string, quizId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });
    if (!user || !quiz) {
      throw new HttpException('User or Quiz not found', HttpStatus.NOT_FOUND);
    }

    const existingParticipation = await this.findParticipation(userId, quizId);
    return !existingParticipation;
  }

  async findParticipation(userId: string, quizId: string) {
    return this.prismaService.quizParticipation.findFirst({
      where: {
        userId,
        quizId,
      },
    });
  }
}
