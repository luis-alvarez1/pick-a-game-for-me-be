import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto) {
    try {
      const exists = await this.usersRepository.findOne({
        where: { email: createUserDto.email.toLowerCase() },
      });
      if (exists) {
        throw new BadRequestException('User already exists!');
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const userData: Partial<User> = {
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        role: 'user',
        password: hashedPassword,
        isActive: true,
      };
      const user = this.usersRepository.create(userData);
      const userDB = await this.usersRepository.save(user);
      return this.cleanUserData(userDB);
    } catch (error) {
      this.logger.log(`Error creating User: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return user;
    } catch (error) {
      this.logger.log(`Error returning User: ${error}`);
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOneById(id: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return user;
    } catch (error) {
      this.logger.log(`Error returning User: ${error}`);

      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      delete updateUserDto.password;
      delete updateUserDto.id;

      const user = await this.findOneById(id);

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const emailExists = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });
        if (emailExists) {
          throw new BadRequestException('Email already in use');
        }
      }

      const newUser = {
        ...user,
        ...updateUserDto,
      } as User;

      const result = await this.usersRepository.save(newUser);
      return this.cleanUserData(result);
    } catch (error) {
      this.logger.error(`Error updating user: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  cleanUserData(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
