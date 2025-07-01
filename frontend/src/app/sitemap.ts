import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecodementor.se'
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // TODO: Add dynamic routes when we have them
  // Example for future blog posts or dynamic content:
  // const dynamicRoutes = await fetchBlogPosts().then(posts => 
  //   posts.map(post => ({
  //     url: `${baseUrl}/blog/${post.slug}`,
  //     lastModified: new Date(post.updatedAt),
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.7,
  //   }))
  // )

  return [
    ...staticRoutes,
    // ...dynamicRoutes,
  ]
} 