import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  episodeId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Must have at least 2 characters' })
  content: string;
}
