import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-minimum-32-characters-long'
)

export type JWTPayload = {
  userId: number
  username: string
  roleId: number
  sessionId: string
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch {
    return null
  }
}
