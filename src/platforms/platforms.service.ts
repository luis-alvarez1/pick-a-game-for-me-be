import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async create(createPlatformDto: CreatePlatformDto) {
    const exists = await this.findOneByName(createPlatformDto.name);

    if (exists) {
      throw new BadRequestException('Platform already exists');
    }

    const platform = this.platformRepository.create(createPlatformDto);

    return await this.platformRepository.save(platform);
  }

  findAll() {
    return `This action returns all platforms`;
  }

  async findOneByName(name: string) {
    const platform = await this.platformRepository.findOneBy({ name });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    return platform;
  }
  async findOne(id: number) {
    const platform = await this.platformRepository.findOneBy({ id });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    return platform;
  }

  async update(id: number, updatePlatformDto: UpdatePlatformDto) {
    const platform = await this.findOne(id);

    const updated = {
      ...platform,
      ...updatePlatformDto,
    };

    return await this.platformRepository.save(updated);
  }
}
