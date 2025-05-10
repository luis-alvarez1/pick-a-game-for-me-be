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
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: () => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
              getOne: jest.fn(),
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
      expect(gamesRepository.findOneBy).toHaveBeenCalledWith({
        name: createGameDto.name,
        platform: { id: createGameDto.platformId },
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
    it('should return paginated games with default values', async () => {
      const mockGames = [mockGame];
      const mockTotal = 1;
      jest
        .spyOn(gamesRepository, 'findAndCount')
        .mockResolvedValue([mockGames, mockTotal]);

      const result = await service.findAll();
      expect(result).toEqual({
        data: mockGames,
        meta: {
          total: mockTotal,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(gamesRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['platform'],
        where: { isActive: true },
        skip: 0,
        take: 10,
      });
    });

    it('should return paginated games with custom page and limit', async () => {
      const mockGames = [mockGame];
      const mockTotal = 15;
      jest
        .spyOn(gamesRepository, 'findAndCount')
        .mockResolvedValue([mockGames, mockTotal]);

      const result = await service.findAll(2, 5);
      expect(result).toEqual({
        data: mockGames,
        meta: {
          total: mockTotal,
          page: 2,
          limit: 5,
          totalPages: 3,
        },
      });
      expect(gamesRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['platform'],
        where: { isActive: true },
        skip: 5,
        take: 5,
      });
    });
  });

  describe('findOne', () => {
    it('should return a game by id', async () => {
      jest.spyOn(gamesRepository, 'findOne').mockResolvedValue(mockGame);

      const result = await service.findOne(1);
      expect(result).toEqual(mockGame);
      expect(gamesRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          isActive: true,
        },
        relations: ['platform'],
      });
    });

    it('should throw NotFoundException if game not found', async () => {
      jest.spyOn(gamesRepository, 'findOne').mockResolvedValue(null);

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
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'LOWER(game.name) LIKE LOWER(:name)',
        { name: '%Test%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'game.completed = :completed',
        { completed: false },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'platform.id = :platformId',
        { platformId: 1 },
      );
    });

    it('should search games with only name filter', async () => {
      const searchGameDto: SearchGameDto = {
        name: 'Test',
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
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'LOWER(game.name) LIKE LOWER(:name)',
        { name: '%Test%' },
      );
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should search games with only completed filter', async () => {
      const searchGameDto: SearchGameDto = {
        completed: true,
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
      expect(queryBuilder.where).not.toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'game.completed = :completed',
        { completed: true },
      );
    });
  });

  describe('pick', () => {
    it('should return a random game', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockGame),
      };

      jest
        .spyOn(gamesRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as unknown as SelectQueryBuilder<Game>);

      const result = await service.pick();
      expect(result).toEqual(mockGame);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'game.completed = :completed',
        { completed: false },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'game.isActive = :isActive',
        { isActive: true },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('RANDOM()');
      expect(queryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if no games found', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(gamesRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as unknown as SelectQueryBuilder<Game>);

      await expect(service.pick()).rejects.toThrow(NotFoundException);
    });
  });
});
