import type { AuthUser } from './AuthUser'
import type { AuthTokens } from './AuthTokens'

export interface AuthResult extends AuthUser, AuthTokens {}
