import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { LockedEpisodes } from './entities/locked-episodes.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(LockedEpisodes)
    private readonly lockedRepository: Repository<LockedEpisodes>,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto, user: User) {
    const locked = await this.isLocked(createCommentDto.episodeId);
    const isAdmin = user.roles.includes('admin');

    if (locked && !isAdmin) {
      throw new UnauthorizedException('Commits are locked for this episode.');
    }

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });

    const savedComment = await this.commentRepository.save(newComment);

    return await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  async findAllByEpisode(episodeId: number) {
    return await this.commentRepository.find({
      where: { episodeId, isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.commentRepository.preload({
      id,
      ...updateCommentDto,
    });

    if (!comment)
      throw new NotFoundException(`Comment with ID ${id} not found`);

    const existingComment = await this.commentRepository.findOneBy({ id });

    if (existingComment?.userId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this comment',
      );
    }

    return await this.commentRepository.save(comment);
  }

  async remove(id: string, user: User) {
    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment)
      throw new NotFoundException(`Comment with ID ${id} not found`);

    const isOwner = comment.userId === user.id;
    const isAdmin = user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException(
        'You are not authorized to delete this comment',
      );
    }

    await this.commentRepository.remove(comment);
    return { deleted: true };
  }

  async toggleStatus(id: string) {
    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment)
      throw new NotFoundException(`Comment with ID ${id} not found`);

    comment.isActive = !comment.isActive;
    return await this.commentRepository.save(comment);
  }

  async toggleLock(episodeId: number) {
    let lockEntry = await this.lockedRepository.findOneBy({ episodeId });

    if (lockEntry) {
      lockEntry.isLocked = !lockEntry.isLocked;
    } else {
      lockEntry = this.lockedRepository.create({ episodeId, isLocked: true });
    }

    return await this.lockedRepository.save(lockEntry);
  }

  async isLocked(episodeId: number): Promise<boolean> {
    const entry = await this.lockedRepository.findOneBy({ episodeId });
    return entry ? entry.isLocked : false;
  }

  async getLockedEpisodes() {
    return await this.lockedRepository.find({
      where: { isLocked: true },
    });
  }
}
