import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { PlatformsModule } from 'src/platforms/platforms.module';
import { Platform } from 'src/platforms/entities/platform.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Platform]), PlatformsModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
