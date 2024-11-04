declare namespace Express {
  interface Request {
    cookies: Record<string, string>
    signedCookies: Record<string, string>
    query: Record<string, unknown>
    user: Record<string, unknown>
    user_token: string
  }
}
