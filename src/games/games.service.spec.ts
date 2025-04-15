import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { PlatformsService } from '../platforms/platforms.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { SearchGameDto } from './dto/search-game.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let gamesRepository: Repository<Game>;
  let platformsService: PlatformsService;

  const mockGame = {
    id: 1,
    name: 'Test Game',
    completed: false,
    isActive: true,
    platform: { id: 1, name: 'Test Platform', games: [] },
  };

  const mockPlatform = {
    id: 1,
    name: 'Test Platform',
    games: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: getRepositoryToken(Game),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: () => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
          },
        },
        {
          provide: PlatformsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    gamesRepository = module.get<Repository<Game>>(getRepositoryToken(Game));
    platformsService = module.get<PlatformsService>(PlatformsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a game successfully', async () => {
      const createGameDto: CreateGameDto = {
        name: 'Test Game',
        platformId: 1,
        completed: false,
      };

      jest.spyOn(gamesRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(platformsService, 'findOne').mockResolvedValue(mockPlatform);
      jest.spyOn(gamesRepository, 'create').mockReturnValue(mockGame);
      jest.spyOn(gamesRepository, 'save').mockResolvedValue(mockGame);

      const result = await service.create(createGameDto);
      expect(result).toEqual(mockGame);
      expect(gamesRepository.create).toHaveBeenCalledWith({
        ...createGameDto,
        platform: mockPlatform,
        completed: false,
      });
    });

    it('should throw BadRequestException if game already exists', async () => {
      const createGameDto: CreateGameDto = {
        name: 'Test Game',
        platformId: 1,
        completed: false,
      };

      jest.spyOn(gamesRepository, 'findOneBy').mockResolvedValue(mockGame);

      await expect(service.create(createGameDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all games', async () => {
      jest.spyOn(gamesRepository, 'find').mockResolvedValue([mockGame]);

      const result = await service.findAll();
      expect(result).toEqual([mockGame]);
    });
  });

  describe('findOne', () => {
    it('should return a game by id', async () => {
      jest.spyOn(gamesRepository, 'findOneBy').mockResolvedValue(mockGame);

      const result = await service.findOne(1);
      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundException if game not found', async () => {
      jest.spyOn(gamesRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a game successfully', async () => {
      const updateGameDto: UpdateGameDto = {
        name: 'Updated Game',
        completed: true,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(gamesRepository, 'save').mockResolvedValue({
        ...mockGame,
        ...updateGameDto,
      });

      const result = await service.update(1, updateGameDto);
      expect(result).toEqual({ ...mockGame, ...updateGameDto });
    });

    it('should update platform if platformId is provided', async () => {
      const updateGameDto: UpdateGameDto = {
        platformId: 2,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(platformsService, 'findOne').mockResolvedValue({
        ...mockPlatform,
        id: 2,
      });
      jest.spyOn(gamesRepository, 'save').mockResolvedValue({
        ...mockGame,
        platform: { ...mockPlatform, id: 2 },
      });

      const result = await service.update(1, updateGameDto);
      expect(result.platform.id).toBe(2);
    });
  });

  describe('remove', () => {
    it('should soft delete a game', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(gamesRepository, 'save').mockResolvedValue({
        ...mockGame,
        isActive: false,
      });

      const result = await service.remove(1);
      expect(result.isActive).toBe(false);
    });
  });

  describe('search', () => {
    it('should search games with filters', async () => {
      const searchGameDto: SearchGameDto = {
        name: 'Test',
        completed: false,
        platformId: 1,
      };

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGame]),
      };

      jest
        .spyOn(gamesRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as unknown as SelectQueryBuilder<Game>);

      const result = await service.search(searchGameDto);
      expect(result).toEqual([mockGame]);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });
});
