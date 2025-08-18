import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔄 [API] Loading site content from Supabase...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: contentData, error } = await supabase
      .from('site_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ [API] Supabase error:', error)
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 })
    }

    // If no content exists yet, return 404 so frontend can use cached content
    if (!contentData || contentData.length === 0) {
      console.log('⚠️ [API] No site content found in database')
      return NextResponse.json({ error: 'No site content found' }, { status: 404 })
    }

    const firstContent = contentData[0]
    console.log('✅ [API] Site content loaded successfully:', firstContent.content?.photographerName || 'Unknown')

    // Return the content from the JSONB field plus metadata
    const formattedContent = {
      id: firstContent.id,
      language: firstContent.language,
      createdAt: firstContent.created_at,
      updatedAt: firstContent.updated_at,
      ...firstContent.content, // Spread the content object
    }

    return NextResponse.json(formattedContent)
  } catch (error) {
    console.error('❌ [API] Unexpected error loading site content:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await request.json()

    // Store all content as JSON in the content field
    const contentData = {
      language: body.language || 'en',
      content: {
        photographerName: body.photographerName,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroDescription: body.heroDescription,
        heroImage: body.heroImage,
        heroImageAspectRatio: body.heroImageAspectRatio,
        experienceYears: body.experienceYears,
        aboutTitle: body.aboutTitle,
        aboutDescription: body.aboutDescription,
        stats: body.stats,
        aboutImage: body.aboutImage,
        aboutImageAspectRatio: body.aboutImageAspectRatio,
        contactTitle: body.contactTitle,
        contactDescription: body.contactDescription,
        email: body.email,
        phone: body.phone,
        location: body.location,
        instagramUrl: body.instagramUrl,
        twitterUrl: body.twitterUrl,
        portfolioTitle: body.portfolioTitle,
        portfolioDescription: body.portfolioDescription,
        navHome: body.navHome,
        navPortfolio: body.navPortfolio,
        navAbout: body.navAbout,
        navContact: body.navContact,
        btnViewPortfolio: body.btnViewPortfolio,
        btnGetInTouch: body.btnGetInTouch,
        btnViewFullGallery: body.btnViewFullGallery,
        labelCountries: body.labelCountries,
        labelPublications: body.labelPublications,
        labelAwards: body.labelAwards,
        labelEmail: body.labelEmail,
        labelPhone: body.labelPhone,
        labelBasedIn: body.labelBasedIn,
      }
    }

    const { data: newContent, error } = await supabase
      .from('site_content')
      .insert(contentData)
      .select()
      .single()

    if (error) {
      console.error('Site content creation error:', error)
      return NextResponse.json({ error: 'Failed to create site content' }, { status: 500 })
    }

    return NextResponse.json({
      id: newContent.id,
      language: newContent.language,
      createdAt: newContent.created_at,
      updatedAt: newContent.updated_at,
      ...newContent.content, // Spread the content object
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
