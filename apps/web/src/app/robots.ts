import { MetadataRoute } from 'next';
import { getSiteBaseUrl, isIndexingRestricted } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();
  const restricted = isIndexingRestricted();

  if (restricted) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

