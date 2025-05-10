import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchGameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return value === 'true';
  })
  completed?: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  platformId?: number;
}
