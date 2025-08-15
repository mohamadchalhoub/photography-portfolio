import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  userId: number
  username: string
  role: string
}

export function verifyAuth(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = verifyAuth(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
