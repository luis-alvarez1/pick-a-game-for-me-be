import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleEnum } from 'src/auth/enums/roles.enum';
import { SearchGameDto } from './dto/search-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @Auth()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  @Auth()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('Invalid page number');
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestException('Invalid limit number');
    }

    return this.gamesService.findAll(parsedPage, parsedLimit);
  }

  @Get('search')
  @Auth()
  search(
    @Query('name') name?: string,
    @Query('completed') completed?: string,
    @Query('platformId') platformId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('Invalid page number');
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestException('Invalid limit number');
    }

    const searchGameDto: SearchGameDto = {
      name,
      ...(completed !== undefined && { completed: completed === 'true' }),
      platformId: platformId ? parseInt(platformId, 10) : undefined,
    };

    return this.gamesService.search(searchGameDto, parsedPage, parsedLimit);
  }

  @Get('pick')
  @Auth()
  pick() {
    return this.gamesService.pick();
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid game ID');
    }
    return this.gamesService.findOne(parsedId);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid game ID');
    }
    return this.gamesService.update(parsedId, updateGameDto);
  }

  @Delete(':id')
  @Auth(RoleEnum.Admin)
  remove(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid game ID');
    }
    return this.gamesService.remove(parsedId);
  }
}
