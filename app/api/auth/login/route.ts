import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabasejs'
import bcrypt from 'bcryptjs'
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

    // Local development fallback - bypass database for local testing
    if (process.env.NODE_ENV === 'development') {
      // Check against environment variables first (most secure)
      const envUsername = process.env.ADMIN_USERNAME || 'admin'
      const envPassword = process.env.ADMIN_PASSWORD || 'password'
      
      if (username === envUsername && password === envPassword) {
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
          message: 'Login successful (local dev)',
          user: {
            id: 1,
            username: username,
            email: 'admin@local.dev',
            role: 'admin',
          }
        })
        
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: false, // false for local development
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })
        
        return response
      }
    }

    // Production/Staging - use database authentication
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Find user by username
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .limit(1)

      if (error || !users || users.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const user = users[0]

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Set HTTP-only cookie
      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response
    } catch (dbError) {
      // If database connection fails, fall back to local dev mode
      if (process.env.NODE_ENV === 'development') {
        // Final fallback for local development
        if (username === 'admin' && password === 'password') {
          const token = jwt.sign(
            {
              userId: 1,
              username: 'admin',
              role: 'admin'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          )
          
          const response = NextResponse.json({
            message: 'Login successful (local dev fallback)',
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@local.dev',
              role: 'admin',
            }
          })
          
          response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
          })
          
          return response
        }
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
