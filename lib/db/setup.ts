import { db, adminUsers } from './index'
import bcrypt from 'bcryptjs'

export async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(adminUsers).limit(1)
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists')
      return
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await db.insert(adminUsers).values({
      username: 'admin',
      email: 'admin@photography.com',
      passwordHash: hashedPassword,
      role: 'admin',
    })

    console.log('Default admin user created successfully')
    console.log('Username: admin')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error creating default admin:', error)
  }
}
