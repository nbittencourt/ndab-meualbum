// Deve ser importado ANTES de qualquer módulo da aplicação: alguns módulos
// (ex.: rotas) leem process.env no escopo de módulo durante o import.
// NODE_ENV é forçado (sem `??`): se o shell já tiver NODE_ENV definido como
// outro valor (ex.: "development"), o testRouter não seria montado (app.ts)
// e as rotas de teste responderiam 404. A suíte unitária sempre roda em "test".
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret-para-testes-apenas';
process.env.CADASTRO_COOLDOWN_SECS = process.env.CADASTRO_COOLDOWN_SECS ?? '5';
