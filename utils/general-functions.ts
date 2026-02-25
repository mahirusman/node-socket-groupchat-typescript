import { hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function encrypt(passwordPlain: string): Promise<string> {
  const encryptedPassword = await hash(passwordPlain, SALT_ROUNDS);
  return encryptedPassword.toString();
}
