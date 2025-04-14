import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum } from '../enums/roles.enum';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const Auth = (...roles: RoleEnum[]) => {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
};
