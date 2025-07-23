import { DrizzleService } from '@ekklesia/database';
import { users, churches, members } from '@ekklesia/database';
import { eq } from 'drizzle-orm';

export async function getUserWithRelations(drizzle: DrizzleService, userId: string) {
  const result = await drizzle.db
    .select({
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatar: users.avatar,
        isActive: users.isActive,
        role: users.role,
        churchId: users.churchId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastLogin: users.lastLogin,
      },
      church: {
        id: churches.id,
        name: churches.name,
        slug: churches.slug,
      },
      member: {
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        status: members.status,
      }
    })
    .from(users)
    .leftJoin(churches, eq(users.churchId, churches.id))
    .leftJoin(members, eq(members.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!result.length) {
    return null;
  }

  const { user, church, member } = result[0];
  return {
    ...user,
    church: church?.id ? church : null,
    member: member?.id ? member : null,
  };
}

export async function getUserByEmailWithoutPassword(drizzle: DrizzleService, email: string) {
  const result = await drizzle.db
    .select({
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatar: users.avatar,
        isActive: users.isActive,
        role: users.role,
        churchId: users.churchId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastLogin: users.lastLogin,
      },
      church: {
        id: churches.id,
        name: churches.name,
        slug: churches.slug,
      },
      member: {
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        status: members.status,
      }
    })
    .from(users)
    .leftJoin(churches, eq(users.churchId, churches.id))
    .leftJoin(members, eq(members.userId, users.id))
    .where(eq(users.email, email))
    .limit(1);

  if (!result.length) {
    return null;
  }

  const { user, church, member } = result[0];
  return {
    ...user,
    church: church?.id ? church : null,
    member: member?.id ? member : null,
  };
}
