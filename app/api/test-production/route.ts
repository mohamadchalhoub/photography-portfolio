import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔧 Testing production database connection...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const databaseUrl = process.env.DATABASE_URL
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasDatabaseUrl: !!databaseUrl,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING'
    })
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ 
        error: 'Missing Supabase environment variables',
        details: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseKey
        }
      }, { status: 500 })
    }
    
    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 1: Basic connection
    const { data: testData, error: testError } = await supabase
      .from('admin_users')
      .select('count(*)')
      .single()
    
    if (testError) {
      console.error('Database test error:', testError)
      return Response.json({ 
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 })
    }
    
    // Test 2: Check admin user
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, username, email, role')
      .eq('username', 'admin')
    
    if (adminError) {
      console.error('Admin user check error:', adminError)
      return Response.json({ 
        error: 'Admin user check failed',
        details: adminError.message
      }, { status: 500 })
    }
    
    return Response.json({
      status: 'success',
      message: 'Database connection working',
      adminUserExists: adminUsers && adminUsers.length > 0,
      adminUserCount: adminUsers?.length || 0,
      adminUsers: adminUsers
    })
    
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return Response.json({ 
      error: 'Unexpected server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
