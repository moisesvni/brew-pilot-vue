export enum UserPlan {
  Free = 'Free',
  Pro = 'Pro',
}

export interface AuthUser {
  userId: string
  email: string
  name: string
  plan: UserPlan
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResult extends AuthUser, AuthTokens {}

export interface OAuthLoginRequest {
  provider: 'google' | 'apple'
  idToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}
