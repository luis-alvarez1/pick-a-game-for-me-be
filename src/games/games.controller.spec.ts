import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { SearchGameDto } from './dto/search-game.dto';
import { BadRequestException } from '@nestjs/common';

jest.mock('src/auth/decorators/auth.decorator', () => ({
  Auth: () => jest.fn(),
}));

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  const mockGame = {
    id: 1,
    name: 'Test Game',
    completed: false,
    isActive: true,
    platform: { id: 1, name: 'Test Platform', games: [] },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
            pick: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a game', async () => {
      const createGameDto: CreateGameDto = {
        name: 'Test Game',
        platformId: 1,
        completed: false,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockGame);

      const result = await controller.create(createGameDto);
      expect(result).toEqual(mockGame);
      expect(service.create).toHaveBeenCalledWith(createGameDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated games with default values', async () => {
      const mockResponse = {
        data: [mockGame],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.findAll();
      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should return paginated games with custom page and limit', async () => {
      const mockResponse = {
        data: [mockGame],
        meta: {
          total: 15,
          page: 2,
          limit: 5,
          totalPages: 3,
        },
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.findAll('2', '5');
      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(2, 5);
    });

    it('should throw BadRequestException for invalid page', async () => {
      try {
        await controller.findAll('0');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid page number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }

      try {
        await controller.findAll('-1');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid page number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }

      try {
        await controller.findAll('invalid');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid page number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });

    it('should throw BadRequestException for invalid limit', async () => {
      try {
        await controller.findAll('1', '0');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid limit number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }

      try {
        await controller.findAll('1', '-1');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid limit number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }

      try {
        await controller.findAll('1', 'invalid');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid limit number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });
  });

  describe('findOne', () => {
    it('should return a game by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockGame);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockGame);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid id', async () => {
      try {
        await controller.findOne('invalid');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid game ID');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });
  });

  describe('update', () => {
    it('should update a game', async () => {
      const updateGameDto: UpdateGameDto = {
        name: 'Updated Game',
        completed: true,
      };

      jest.spyOn(service, 'update').mockResolvedValue({
        ...mockGame,
        ...updateGameDto,
      });

      const result = await controller.update('1', updateGameDto);
      expect(result).toEqual({ ...mockGame, ...updateGameDto });
      expect(service.update).toHaveBeenCalledWith(1, updateGameDto);
    });

    it('should throw BadRequestException for invalid id', async () => {
      try {
        await controller.update('invalid', {});
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid game ID');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });
  });

  describe('remove', () => {
    it('should remove a game', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({
        ...mockGame,
        isActive: false,
      });

      const result = await controller.remove('1');
      expect(result).toEqual({ ...mockGame, isActive: false });
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid id', async () => {
      try {
        await controller.remove('invalid');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid game ID');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });
  });

  describe('search', () => {
    it('should search games with filters and pagination', async () => {
      const mockResponse = {
        data: [mockGame],
        meta: {
          total: 15,
          page: 2,
          limit: 5,
          totalPages: 3,
        },
      };

      jest.spyOn(service, 'search').mockResolvedValue(mockResponse);

      const result = await controller.search('Test', 'false', '1', '2', '5');
      expect(result).toEqual(mockResponse);
      expect(service.search).toHaveBeenCalledWith(
        {
          name: 'Test',
          completed: false,
          platformId: 1,
        },
        2,
        5,
      );
    });

    it('should search games with default pagination', async () => {
      const mockResponse = {
        data: [mockGame],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      jest.spyOn(service, 'search').mockResolvedValue(mockResponse);

      const result = await controller.search('Test');
      expect(result).toEqual(mockResponse);
      expect(service.search).toHaveBeenCalledWith(
        {
          name: 'Test',
        },
        1,
        10,
      );
    });

    it('should search games without completed filter when not provided', async () => {
      const mockResponse = {
        data: [mockGame],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      jest.spyOn(service, 'search').mockResolvedValue(mockResponse);

      const result = await controller.search('Test', undefined, '1');
      expect(result).toEqual(mockResponse);
      expect(service.search).toHaveBeenCalledWith(
        {
          name: 'Test',
          platformId: 1,
        },
        1,
        10,
      );
    });

    it('should throw BadRequestException for invalid page', async () => {
      try {
        await controller.search('Test', 'true', '1', '0');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid page number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });

    it('should throw BadRequestException for invalid limit', async () => {
      try {
        await controller.search('Test', 'true', '1', '1', '0');
        fail('Expected BadRequestException to be thrown');
      } catch (error: unknown) {
        if (error instanceof BadRequestException) {
          expect(error.message).toBe('Invalid limit number');
        } else {
          fail('Expected BadRequestException to be thrown');
        }
      }
    });
  });

  describe('pick', () => {
    it('should return a random game', async () => {
      jest.spyOn(service, 'pick').mockResolvedValue(mockGame);

      const result = await controller.pick();
      expect(result).toEqual(mockGame);
      expect(service.pick).toHaveBeenCalled();
    });
  });
});
