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

  @Post('import')
  async importGames() {
    return this.gamesService.importGames();
  }
  @Post()
  @Auth()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  @Auth()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get('search')
  @Auth()
  search(@Query() searchGameDto: SearchGameDto) {
    return this.gamesService.search(searchGameDto);
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
