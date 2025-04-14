import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class SearchGameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsNumber()
  @IsOptional()
  platformId?: number;
}
