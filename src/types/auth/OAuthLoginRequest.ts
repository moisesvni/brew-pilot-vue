export interface OAuthLoginRequest {
  provider: 'google' | 'apple'
  idToken: string
}
