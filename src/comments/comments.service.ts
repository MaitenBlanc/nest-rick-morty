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

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto) {
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });

    return await this.commentRepository.save(newComment);
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

    if (comment.userId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this comment',
      );
    }

    await this.commentRepository.remove(comment);
    return { delete: true };
  }

  async toggleStatus(id: string) {
    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment)
      throw new NotFoundException(`Comment with ID ${id} not found`);

    comment.isActive = !comment.isActive;
    return await this.commentRepository.save(comment);
  }
}
