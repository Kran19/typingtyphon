import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { GuestSessionMigrationDto } from './dto/migration.dto';

@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('sessions/submit')
  @UseGuards(OptionalJwtAuthGuard)
  async submitSession(@Body() dto: CreateSessionDto, @Req() req: any) {
    const userId = req.user?.id;
    const session = await this.progressService.submitSession(dto, userId);
    return {
      success: true,
      sessionId: session.id,
    };
  }

  @Post('progress/migrate')
  @UseGuards(JwtAuthGuard)
  async migrateHistory(@Body() dto: GuestSessionMigrationDto, @Req() req: any) {
    const userId = req.user.id;
    const result = await this.progressService.migrateGuestHistory(dto, userId);
    return {
      success: true,
      ...result,
    };
  }

  @Get('sessions/history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Req() req: any) {
    const userId = req.user.id;
    const history = await this.progressService.getUserHistory(userId);
    return {
      success: true,
      items: history,
    };
  }

  @Get('progress/summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(@Req() req: any) {
    const userId = req.user.id;
    const summary = await this.progressService.getUserProgressSummary(userId);
    return {
      success: true,
      data: summary,
    };
  }
}
