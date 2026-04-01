import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getUserFavorites(@GetUser() user: User) {
    return this.favoritesService.getUserFavorites(user.id);
  }

  @Post(':id')
  addFavorite(
    @Param('id', ParseIntPipe) episodeId: number,
    @GetUser() user: User,
  ) {
    return this.favoritesService.addFavorite(user.id, episodeId);
  }

  @Delete(':id')
  removeFavorite(
    @Param('id', ParseIntPipe) episodeId: number,
    @GetUser() user: User,
  ) {
    return this.favoritesService.removeFavorite(user.id, episodeId);
  }
}
