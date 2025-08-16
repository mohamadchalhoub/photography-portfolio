# Photography Portfolio

A modern, responsive photography portfolio website built with Next.js, featuring admin dashboard, database integration, and multi-language support.

## ✨ Features

- **📸 Portfolio Gallery**: Showcase photography albums with responsive design
- **🔐 Admin Dashboard**: Secure admin panel for content management
- **🗄️ Database Integration**: Supabase for data persistence
- **🌍 Multi-language**: English and Arabic support
- **🎨 Theme System**: Multiple color themes
- **📱 Responsive Design**: Mobile-first approach with modern UI
- **🖼️ Image Management**: Upload and organize photos by albums
- **🔒 Authentication**: JWT-based secure authentication

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **Authentication**: JWT with bcryptjs
- **Image Storage**: Vercel Blob Storage

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd photographyPortfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     DATABASE_URL="your-supabase-connection-string"
     NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
     SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
     JWT_SECRET="your-jwt-secret"
     BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
     ```

4. **Database Setup**
   ```bash
   pnpm db:push
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 🔑 Default Admin Credentials

- **Username**: `admin`
- **Password**: `password`

## 📁 Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── gallery/           # Gallery pages
│   └── album/             # Album detail pages
├── components/            # Reusable UI components
├── lib/                   # Utilities and database
│   ├── db/               # Database schema and config
│   └── auth.ts           # Authentication utilities
├── hooks/                 # Custom React hooks
├── styles/                # Global styles
└── public/                # Static assets
```

## 🚀 Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 📝 Usage

1. **View Portfolio**: Visit the homepage to browse photography albums
2. **Admin Access**: Click the admin login to access the dashboard
3. **Manage Content**: Create, edit, and delete albums through the admin panel
4. **Upload Images**: Add photos to albums with drag-and-drop interface
5. **Customize**: Modify site content, themes, and settings

## 🎨 Customization

- **Themes**: Modify theme colors in the admin panel
- **Content**: Update site content, photographer info, and about section
- **Languages**: Add or modify translations in the language system
- **Styling**: Customize Tailwind CSS classes for design changes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and Supabase
