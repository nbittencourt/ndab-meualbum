// Deve ser importado ANTES de qualquer módulo da aplicação: alguns módulos
// (ex.: rotas) leem process.env no escopo de módulo durante o import.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret-para-testes-apenas';
process.env.CADASTRO_COOLDOWN_SECS = process.env.CADASTRO_COOLDOWN_SECS ?? '5';
