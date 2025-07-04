import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecodementor.net'
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Blog posts
  const blogPosts: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog/from-bus-ride-to-90k-users`,
      lastModified: new Date('2025-07-04'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/amazing-time-to-be-alive`,
      lastModified: new Date('2025-07-04'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/vibecoding-template`,
      lastModified: new Date('2025-07-04'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  return [
    ...staticRoutes,
    ...blogPosts,
  ]
} 