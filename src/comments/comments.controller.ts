import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    return this.commentsService.create(user.id, createCommentDto, user);
  }

  @Get('episode/:episodeId')
  findAll(@Param('episodeId', ParseIntPipe) episodeId: number) {
    return this.commentsService.findAllByEpisode(episodeId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.commentsService.remove(id, user);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.toggleStatus(id);
  }

  @Patch('lock/:episodeId')
  @UseGuards(AuthGuard('jwt'))
  async toggleLock(
    @Param('episodeId', ParseIntPipe) episodeId: number,
    @GetUser() user: User,
  ) {
    if (!user.roles.includes('admin')) {
      throw new UnauthorizedException('Only admins can toggle the lock.');
    }

    return this.commentsService.toggleLock(episodeId);
  }

  @Get('lock-status/:episodeId')
  checkLock(@Param('episodeId', ParseIntPipe) episodeId: number) {
    return this.commentsService.isLocked(episodeId);
  }

  @Get('admin/locked')
  @UseGuards(AuthGuard('jwt'))
  getLockedEpisodes(@GetUser() user: User) {
    if (!user.roles?.includes('admin')) {
      throw new UnauthorizedException('Only admins can view locked episodes.');
    }
    return this.commentsService.getLockedEpisodes();
  }
}
