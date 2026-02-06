export interface GoogleAuthSuccessResponse {
  token: string
  email: string
  name: string
  picture: string
}

export interface GoogleAuthErrorResponse {
  error: string
}
