import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PlatformsService } from 'src/platforms/platforms.service';
import { SearchGameDto } from './dto/search-game.dto';
import * as fs from 'fs';
import * as path from 'path';

interface GameImportData {
  Game: string;
  Platform: string;
  Completed: boolean;
}

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly platformService: PlatformsService,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const exists = await this.gamesRepository.findOneBy({
      name: createGameDto.name.toLowerCase(),
      platform: { id: createGameDto.platformId },
    });

    if (exists) {
      throw new BadRequestException('Game already exists on this platform');
    }

    const platform = await this.platformService.findOne(
      createGameDto.platformId,
    );

    const game = this.gamesRepository.create({
      ...createGameDto,
      platform,
      completed: !!createGameDto.completed,
    });

    return await this.gamesRepository.save(game);
  }

  async findAll() {
    return await this.gamesRepository.find({
      relations: ['platform'],
    });
  }

  async findOne(id: number) {
    const game = await this.gamesRepository.findOne({
      where: { id },
      relations: ['platform'],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.findOne(id);

    if (updateGameDto.platformId) {
      const platform = await this.platformService.findOne(
        updateGameDto.platformId,
      );
      game.platform = platform;
    }

    if (updateGameDto.name) {
      game.name = updateGameDto.name;
    }

    if (updateGameDto.completed !== undefined) {
      game.completed = updateGameDto.completed;
    }

    return await this.gamesRepository.save(game);
  }

  async remove(id: number) {
    const game = await this.findOne(id);
    return await this.gamesRepository.save({ ...game, isActive: false });
  }

  async search(searchGameDto: SearchGameDto) {
    const queryBuilder = this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.platform', 'platform');

    if (searchGameDto.name) {
      queryBuilder.where('LOWER(game.name) LIKE LOWER(:name)', {
        name: `%${searchGameDto.name}%`,
      });
    }

    if (searchGameDto.completed !== undefined) {
      queryBuilder.andWhere('game.completed = :completed', {
        completed: searchGameDto.completed,
      });
    }

    if (searchGameDto.platformId) {
      queryBuilder.andWhere('platform.id = :platformId', {
        platformId: searchGameDto.platformId,
      });
    }

    return await queryBuilder.getMany();
  }

  async pick() {
    const game = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.platform', 'platform')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!game) {
      throw new NotFoundException('No games found');
    }

    return game;
  }

  async importGames() {
    const filePath = path.join(process.cwd(), 'games.json');
    const gamesData = JSON.parse(
      fs.readFileSync(filePath, 'utf8'),
    ) as GameImportData[];

    const platformMap = new Map<string, number>();
    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
    };

    for (const gameData of gamesData) {
      try {
        let platformId = platformMap.get(gameData.Platform);

        if (!platformId) {
          try {
            const platform = await this.platformService.findOneByName(
              gameData.Platform,
            );
            platformId = platform.id;
          } catch (error) {
            if (error instanceof NotFoundException) {
              const newPlatform = await this.platformService.create({
                name: gameData.Platform,
              });
              platformId = newPlatform.id;
            } else {
              throw error;
            }
          }
          platformMap.set(gameData.Platform, platformId);
        }

        const createGameDto: CreateGameDto = {
          name: gameData.Game,
          platformId,
          completed: gameData.Completed,
        };

        try {
          await this.create(createGameDto);
          results.imported++;
        } catch (error) {
          if (error instanceof BadRequestException) {
            results.skipped++;
          } else {
            results.errors++;
          }
        }
      } catch (error) {
        results.errors++;
      }
    }

    return results;
  }
}
