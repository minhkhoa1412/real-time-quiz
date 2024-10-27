import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { QuizParticipantStatus } from '@prisma/client';
import { create } from 'domain';
import { connect } from 'http2';
import { update } from 'lodash';
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
    let participation = await this.getParticipant(userId, quizId);

    if (participation) {
      participation = await this.prismaService.quizParticipation.update({
        where: { id: participation.id },
        data: {
          status: QuizParticipantStatus.ACTIVE,
        },
        include: { user: true },
      });
    } else {
      participation = await this.prismaService.quizParticipation.create({
        data: {
          user: { connect: { id: userId } },
          quiz: { connect: { id: quizId } },
          status: QuizParticipantStatus.ACTIVE,
        },
        include: { user: true },
      });
    }

    return participation;
  }

  async completeTheQuiz(userId: string, quizId: string) {
    const participation = await this.getParticipant(userId, quizId);
    if (!participation) {
      return {
        errorMessage: 'User has not joined the quiz',
      };
    }

    return this.prismaService.quizParticipation.update({
      where: { id: participation.id },
      data: {
        status: QuizParticipantStatus.COMPLETED,
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

  async getParticipant(userId: string, quizId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });
    if (!user || !quiz) {
      throw new HttpException('User or Quiz not found', HttpStatus.NOT_FOUND);
    }

    return await this.prismaService.quizParticipation.findFirst({
      where: {
        userId,
        quizId,
      },
      include: { user: true },
    });
  }

  async getParticipants(
    quizId: string,
    status: QuizParticipantStatus = QuizParticipantStatus.ACTIVE,
  ) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
      include: {
        participants: {
          where: { status },
          include: { user: true },
        },
      },
    });

    if (!quiz) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }

    return quiz.participants;
  }
}
