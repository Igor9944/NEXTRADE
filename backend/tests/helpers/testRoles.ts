import { Pool } from 'pg';
import { generateToken } from '../../src/utils/jwt';

export type PrivilegedTestRole = 'ADMIN' | 'FOURNISSEUR' | 'COMMERCANT' | 'TRANSPORTEUR';

export async function provisionTestRole(pool: Pool, userId: string, role: PrivilegedTestRole): Promise<string> {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id_user = $2 RETURNING id_user, email, role',
    [role, userId]
  );
  const user = result.rows[0];
  if (!user) {
    throw new Error(`Test user ${userId} was not found`);
  }

  return generateToken({ id: user.id_user, email: user.email, role: user.role });
}