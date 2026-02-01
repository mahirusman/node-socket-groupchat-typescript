import { hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function encrypt(password_plain: string): Promise<string> {
  const encrypted_password = await hash(password_plain, SALT_ROUNDS);
  return encrypted_password.toString();
}
