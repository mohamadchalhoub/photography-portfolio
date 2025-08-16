import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: contentData, error } = await supabase
      .from('site_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Site content fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch site content' }, { status: 500 })
    }

    // Convert snake_case to camelCase for frontend
    const formattedContent = {
      id: contentData.id,
      photographerName: contentData.photographer_name,
      heroTitle: contentData.hero_title,
      heroSubtitle: contentData.hero_subtitle,
      heroDescription: contentData.hero_description,
      heroImage: contentData.hero_image,
      heroImageAspectRatio: contentData.hero_image_aspect_ratio,
      experienceYears: contentData.experience_years,
      aboutTitle: contentData.about_title,
      aboutDescription: contentData.about_description, // This is already a JSON array
      stats: contentData.stats, // This is already a JSON object
      aboutImage: contentData.about_image,
      aboutImageAspectRatio: contentData.about_image_aspect_ratio,
      contactTitle: contentData.contact_title,
      contactDescription: contentData.contact_description,
      email: contentData.email,
      phone: contentData.phone,
      location: contentData.location,
      instagramUrl: contentData.instagram_url,
      twitterUrl: contentData.twitter_url,
      portfolioTitle: contentData.portfolio_title,
      portfolioDescription: contentData.portfolio_description,
      navHome: contentData.nav_home,
      navPortfolio: contentData.nav_portfolio,
      navAbout: contentData.nav_about,
      navContact: contentData.nav_contact,
      btnViewPortfolio: contentData.btn_view_portfolio,
      btnGetInTouch: contentData.btn_get_in_touch,
      btnViewFullGallery: contentData.btn_view_full_gallery,
      labelCountries: contentData.label_countries,
      labelPublications: contentData.label_publications,
      labelAwards: contentData.label_awards,
      labelEmail: contentData.label_email,
      labelPhone: contentData.label_phone,
      labelBasedIn: contentData.label_based_in,
      language: contentData.language,
      createdAt: contentData.created_at,
      updatedAt: contentData.updated_at,
    }

    return NextResponse.json(formattedContent)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await request.json()

    // Convert camelCase to snake_case for database
    const contentData = {
      photographer_name: body.photographerName,
      hero_title: body.heroTitle,
      hero_subtitle: body.heroSubtitle,
      hero_description: body.heroDescription,
      hero_image: body.heroImage,
      hero_image_aspect_ratio: body.heroImageAspectRatio,
      experience_years: body.experienceYears,
      about_title: body.aboutTitle,
      about_description: body.aboutDescription,
      stats: body.stats,
      about_image: body.aboutImage,
      about_image_aspect_ratio: body.aboutImageAspectRatio,
      contact_title: body.contactTitle,
      contact_description: body.contactDescription,
      email: body.email,
      phone: body.phone,
      location: body.location,
      instagram_url: body.instagramUrl,
      twitter_url: body.twitterUrl,
      portfolio_title: body.portfolioTitle,
      portfolio_description: body.portfolioDescription,
      nav_home: body.navHome,
      nav_portfolio: body.navPortfolio,
      nav_about: body.navAbout,
      nav_contact: body.navContact,
      btn_view_portfolio: body.btnViewPortfolio,
      btn_get_in_touch: body.btnGetInTouch,
      btn_view_full_gallery: body.btnViewFullGallery,
      label_countries: body.labelCountries,
      label_publications: body.labelPublications,
      label_awards: body.labelAwards,
      label_email: body.labelEmail,
      label_phone: body.labelPhone,
      label_based_in: body.labelBasedIn,
      language: body.language || 'en',
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
      photographerName: newContent.photographer_name,
      heroTitle: newContent.hero_title,
      heroSubtitle: newContent.hero_subtitle,
      heroDescription: newContent.hero_description,
      heroImage: newContent.hero_image,
      heroImageAspectRatio: newContent.hero_image_aspect_ratio,
      experienceYears: newContent.experience_years,
      aboutTitle: newContent.about_title,
      aboutDescription: newContent.about_description,
      stats: newContent.stats,
      aboutImage: newContent.about_image,
      aboutImageAspectRatio: newContent.about_image_aspect_ratio,
      contactTitle: newContent.contact_title,
      contactDescription: newContent.contact_description,
      email: newContent.email,
      phone: newContent.phone,
      location: newContent.location,
      instagramUrl: newContent.instagram_url,
      twitterUrl: newContent.twitter_url,
      portfolioTitle: newContent.portfolio_title,
      portfolioDescription: newContent.portfolio_description,
      navHome: newContent.nav_home,
      navPortfolio: newContent.nav_portfolio,
      navAbout: newContent.nav_about,
      navContact: newContent.nav_contact,
      btnViewPortfolio: newContent.btn_view_portfolio,
      btnGetInTouch: newContent.btn_get_in_touch,
      btnViewFullGallery: newContent.btn_view_full_gallery,
      labelCountries: newContent.label_countries,
      labelPublications: newContent.label_publications,
      labelAwards: newContent.label_awards,
      labelEmail: newContent.label_email,
      labelPhone: newContent.label_phone,
      labelBasedIn: newContent.label_based_in,
      language: newContent.language,
      createdAt: newContent.created_at,
      updatedAt: newContent.updated_at,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
