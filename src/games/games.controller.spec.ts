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
    it('should return all games', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockGame]);

      const result = await controller.findAll();
      expect(result).toEqual([mockGame]);
      expect(service.findAll).toHaveBeenCalled();
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
      await expect(controller.findOne('invalid')).rejects.toThrow(
        new BadRequestException('Invalid game ID'),
      );
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
      await expect(controller.update('invalid', {})).rejects.toThrow(
        new BadRequestException('Invalid game ID'),
      );
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
      await expect(controller.remove('invalid')).rejects.toThrow(
        new BadRequestException('Invalid game ID'),
      );
    });
  });

  describe('search', () => {
    it('should search games with filters', async () => {
      const searchGameDto: SearchGameDto = {
        name: 'Test',
        completed: false,
        platformId: 1,
      };

      jest.spyOn(service, 'search').mockResolvedValue([mockGame]);

      const result = await controller.search(searchGameDto);
      expect(result).toEqual([mockGame]);
      expect(service.search).toHaveBeenCalledWith(searchGameDto);
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
