import { IsString, MinLength, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  nickname?: string;

  @IsString()
  @IsOptional()
  birthdate?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  city?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  state?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  imgProfile?: string;
}
