import { Test, TestingModule } from '@nestjs/testing';
import { PlatformsService } from './platforms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { Repository } from 'typeorm';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PlatformsService', () => {
  let service: PlatformsService;
  let platformRepository: Repository<Platform>;

  const mockPlatform = {
    id: 1,
    name: 'Test Platform',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformsService,
        {
          provide: getRepositoryToken(Platform),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlatformsService>(PlatformsService);
    platformRepository = module.get<Repository<Platform>>(
      getRepositoryToken(Platform),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a platform successfully', async () => {
      const createPlatformDto: CreatePlatformDto = {
        name: 'Test Platform',
      };

      jest.spyOn(platformRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(platformRepository, 'create').mockReturnValue(mockPlatform);
      jest.spyOn(platformRepository, 'save').mockResolvedValue(mockPlatform);

      const result = await service.create(createPlatformDto);
      expect(result).toEqual(mockPlatform);
      expect(platformRepository.create).toHaveBeenCalledWith(createPlatformDto);
    });

    it('should throw BadRequestException if platform already exists', async () => {
      const createPlatformDto: CreatePlatformDto = {
        name: 'Test Platform',
      };

      jest
        .spyOn(platformRepository, 'findOneBy')
        .mockResolvedValue(mockPlatform);

      await expect(service.create(createPlatformDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all platforms', async () => {
      jest.spyOn(platformRepository, 'find').mockResolvedValue([mockPlatform]);

      const result = await service.findAll();
      expect(result).toEqual([mockPlatform]);
    });
  });

  describe('findOneByName', () => {
    it('should return a platform by name', async () => {
      jest
        .spyOn(platformRepository, 'findOneBy')
        .mockResolvedValue(mockPlatform);

      const result = await service.findOneByName('Test Platform');
      expect(result).toEqual(mockPlatform);
    });

    it('should throw NotFoundException if platform not found', async () => {
      jest.spyOn(platformRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.findOneByName('Non-existent Platform'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a platform by id', async () => {
      jest
        .spyOn(platformRepository, 'findOneBy')
        .mockResolvedValue(mockPlatform);

      const result = await service.findOne(1);
      expect(result).toEqual(mockPlatform);
    });

    it('should throw NotFoundException if platform not found', async () => {
      jest.spyOn(platformRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a platform', async () => {
      const updatePlatformDto: UpdatePlatformDto = {
        name: 'Updated Platform',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockPlatform);
      jest.spyOn(platformRepository, 'save').mockResolvedValue({
        ...mockPlatform,
        ...updatePlatformDto,
      });

      const result = await service.update(1, updatePlatformDto);
      expect(result).toEqual({ ...mockPlatform, ...updatePlatformDto });
    });
  });
});
