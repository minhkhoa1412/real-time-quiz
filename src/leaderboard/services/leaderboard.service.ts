import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/prisma/services/prisma.service';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalScore: number;
  rankNumber: number;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllLeaderboards() {
    const leaderboard = await this.prismaService.quizParticipation.groupBy({
      by: ['userId'],
      _sum: {
        score: true,
      },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: 20,
    });

    const userIds = leaderboard.map((entry) => entry.userId);
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        userName: true,
      },
    });

    const leaderboardWithUserInfo = leaderboard.map((entry, index) => {
      const user = users.find((u) => u.id === entry.userId);
      return {
        userId: entry.userId,
        userName: user?.userName,
        totalScore: entry._sum.score,
        rankNumber: index + 1,
      };
    });

    return leaderboardWithUserInfo;
  }

  async getUserRank(
    userId: string,
    quizId: string,
    newScore: number,
  ): Promise<LeaderboardEntry> {
    // get total score of the user for all quizzes
    const userTotalScore = await this.prismaService.quizParticipation.groupBy({
      by: ['userId'],
      _sum: {
        score: true,
      },
      where: {
        userId: userId,
      },
    });

    const currentTotalScore = userTotalScore[0]?._sum.score ?? 0;
    const totalScore = currentTotalScore - (await this.getCurrentScore(userId, quizId)) + newScore;

    const allUserScores = await this.prismaService.quizParticipation.groupBy({
      by: ['userId'],
      _sum: {
        score: true,
      },
    });

    const higherScoresCount = allUserScores.filter(entry => entry._sum.score > totalScore).length;
    const rankNumber = higherScoresCount + 1;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
      },
    });

    return {
      userId: user.id,
      userName: user.userName,
      totalScore,
      rankNumber,
    };
  }

  private async getCurrentScore(
    userId: string,
    quizId: string,
  ): Promise<number> {
    const participation = await this.prismaService.quizParticipation.findFirst({
      where: {
        userId: userId,
        quizId: quizId,
      },
      select: {
        score: true,
      },
    });

    return participation?.score ?? 0;
  }
}
