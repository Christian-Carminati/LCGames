import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export type AdminAction =
  | 'DELETE_SCORE'
  | 'UPDATE_DIFFICULTY'
  | 'DELETE_USER'
  | 'RESTORE_SCORE'
  | 'CREATE_GAME'
  | 'UPDATE_GAME'
  | 'DELETE_GAME';

export async function logAction(params: {
  action: AdminAction;
  entityType: string;
  entityId: string;
  adminId: string;
  oldValue?: unknown;
  newValue?: unknown;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      adminId: params.adminId,
      oldValue: (params.oldValue ?? Prisma.DbNull) as Prisma.InputJsonValue,
      newValue: (params.newValue ?? Prisma.DbNull) as Prisma.InputJsonValue,
    },
  });
}

export async function getAuditLog(params: {
  cursor?: string;
  limit?: number;
}): Promise<{ entries: any[]; nextCursor: string | null }> {
  const { cursor, limit = 50 } = params;

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  const result = hasMore ? entries.slice(0, limit) : entries;

  return {
    entries: result,
    nextCursor: hasMore ? result[result.length - 1].id : null,
  };
}
