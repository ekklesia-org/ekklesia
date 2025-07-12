import { foreignKey } from 'drizzle-orm/pg-core';
import { members } from './schema';

// Self-referencing foreign key for spouse relationship
export const spouseForeignKey = foreignKey({
  columns: [members.spouseId],
  foreignColumns: [members.id],
  name: 'members_spouseId_members_id_fk'
});
