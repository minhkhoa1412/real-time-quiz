import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from '../services/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getAllLeaderboards() {
    return await this.leaderboardService.getAllLeaderboards();
  }
}
