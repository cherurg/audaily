export interface OAuth2Token {
  access_token: string
  expires_at: number
  refresh_token: string
  scope: string
  token_type: string
}
