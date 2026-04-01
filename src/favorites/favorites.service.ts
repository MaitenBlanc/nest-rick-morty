import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async getUserFavorites(userId: string): Promise<number[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      select: ['episodeId'],
    });
    return favorites.map((fav) => fav.episodeId);
  }

  async addFavorite(userId: string, episodeId: number) {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, episodeId },
    });

    if (existing) return existing;

    const newFavorite = this.favoriteRepository.create({
      userId,
      episodeId,
    });

    return await this.favoriteRepository.save(newFavorite);
  }

  async removeFavorite(userId: string, episodeId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, episodeId },
    });

    if (!favorite) throw new NotFoundException('Favorite not found');

    await this.favoriteRepository.remove(favorite);
    return { message: 'Favorite removed successfully' };
  }
}
