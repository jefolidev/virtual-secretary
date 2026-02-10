export interface GoogleAuthSuccessResponse {
  access_token: string
  email: string
  name: string
  picture: string
}

export interface GoogleAuthErrorResponse {
  error: string
}
