/**
 * Uma array de rotas que são acessiveis para o público
 * Essas rotas nao precisam de autenticação
 * @type {string[]}
 */

export const publicRoutes = ["/auth/login", "/auth/register"];

/**
 * Uma array de rotas que são usadas para autenticação
 * @type {string[]}
 */

export const authRoutes = ["/auth/login", "/auth/register", "/auth/error"];

/**
 * Prefixo para as rotas da API de autenticação
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * A rota padrão após o login
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
