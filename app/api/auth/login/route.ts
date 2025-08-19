import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Simple local authentication
    if (username === 'admin' && password === 'password') {
      const token = jwt.sign(
        {
          userId: 1,
          username: username,
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: 1,
          username: username,
          email: 'admin@photography.com',
          role: 'admin',
        }
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })
      
      return response
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
