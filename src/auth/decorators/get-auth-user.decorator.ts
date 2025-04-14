import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetAuthUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const req: Express.Request = ctx.switchToHttp().getRequest();

  const user = req.user;

  if (!user) {
    throw new InternalServerErrorException('User is not in request');
  }

  return user;
});
