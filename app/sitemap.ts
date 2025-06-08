import type { MetadataRoute } from 'next';

const baseUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ];
}
