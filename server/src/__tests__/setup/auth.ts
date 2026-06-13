import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';

let seq = 0;

/**
 * Cria um usuário ATIVO diretamente no banco e devolve o cookie de sessão
 * no formato esperado pelo middleware requireAuth (cookie __session com JWT).
 */
export async function criarUsuarioAutenticado(overrides: Record<string, unknown> = {}) {
  seq += 1;
  const user = await User.create({
    name: 'Usuário Integração',
    email: `int+${Date.now()}_${seq}@exemplo.com`,
    passwordHash: 'Senha@123',
    status: 'ATIVO',
    declaracaoMaioridadeEm: new Date(),
    ...overrides,
  });
  const token = jwt.sign(
    { sub: String(user._id), tokenVersao: user.tokenVersao },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  return { user, cookie: `__session=${token}` };
}
