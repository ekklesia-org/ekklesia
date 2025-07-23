import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

// Interface for the user data from JWT token
export interface CurrentUserData {
  userId: string;
  username: string;
  role: string;
  churchId?: string;
}

/**
 * Custom decorator to extract current authenticated user from JWT token
 * Usage: @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('No user found in request');
    }

    return user as CurrentUserData;
  },
);
