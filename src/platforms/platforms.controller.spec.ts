import { Test, TestingModule } from '@nestjs/testing';
import { PlatformsController } from './platforms.controller';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';

describe('PlatformsController', () => {
  let controller: PlatformsController;
  let service: PlatformsService;

  const mockPlatform = {
    id: 1,
    name: 'Test Platform',
    games: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformsController],
      providers: [
        {
          provide: PlatformsService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlatformsController>(PlatformsController);
    service = module.get<PlatformsService>(PlatformsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a platform', async () => {
      const createPlatformDto: CreatePlatformDto = {
        name: 'Test Platform',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockPlatform);

      const result = await controller.create(createPlatformDto);
      expect(result).toEqual(mockPlatform);
      expect(service.create).toHaveBeenCalledWith(createPlatformDto);
    });
  });

  describe('findOne', () => {
    it('should return a platform by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPlatform);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockPlatform);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a platform', async () => {
      const updatePlatformDto: UpdatePlatformDto = {
        name: 'Updated Platform',
      };

      jest.spyOn(service, 'update').mockResolvedValue({
        ...mockPlatform,
        ...updatePlatformDto,
      });

      const result = await controller.update('1', updatePlatformDto);
      expect(result).toEqual({ ...mockPlatform, ...updatePlatformDto });
      expect(service.update).toHaveBeenCalledWith(1, updatePlatformDto);
    });
  });
});
