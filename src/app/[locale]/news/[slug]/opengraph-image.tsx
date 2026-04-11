import { ImageResponse } from 'next/og';
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'News Article Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Fallback image loading from local public folder
const logoDataPromise = fetch(
  new URL('../../../../../public/logo-gold.png', import.meta.url)
).then((res) => res.arrayBuffer()).catch(() => null);

export default async function Image({ params }: { params: { slug: string; locale: string } }) {
  const { slug } = await params;

  // Load logo as fallback
  const logoData = await logoDataPromise;
  
  // Fetch article data for the OG image
  let articleTitle = "Legal News";
  let thumbnailUrl: string | ArrayBuffer | null = logoData;
  let categoryName = "Legal Updates";

  try {
    const res = await fetch(`${API_BASE_URL}/articles/${slug}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (res.ok) {
        const responseData = await res.json();
        const article = responseData.data;
        if (article) {
            articleTitle = article.title;
            // Use article thumbnail if present, fallback to local logo
            // For OG images, usually raw S3 is fine if we are within the Edge Runtime
            thumbnailUrl = article.thumbnail || logoData;
            if (article.category?.name) {
                categoryName = article.category.name;
            }
        }
    }
  } catch (error) {
    console.error("Error fetching article for OG image:", error);
  }

  return new ImageResponse(
    (
      // ImageResponse JSX
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#fff',
          position: 'relative',
        }}
      >
        {/* Background Thumbnail Image */}
        <img
          src={thumbnailUrl as any}
          alt={articleTitle}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: thumbnailUrl === logoData ? 'contain' : 'cover',
            backgroundColor: thumbnailUrl === logoData ? '#1a1a1a' : 'transparent',
            padding: thumbnailUrl === logoData ? '100px' : '0',
          }}
        />
        
        {/* Darkened Overlay for Text Readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />

        {/* Branding & Text Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 60px',
            zIndex: 10,
            width: '100%',
          }}
        >
          {/* Category Badge */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#C9A227',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              alignSelf: 'flex-start',
              textTransform: 'uppercase',
            }}
          >
            {categoryName}
          </div>

          {/* Article Title */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '20px',
              fontFamily: 'sans-serif',
              display: 'flex',
            }}
          >
            {articleTitle.length > 80 ? articleTitle.substring(0, 80) + "..." : articleTitle}
          </div>

          {/* Logo / Site Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '20px',
            }}
          >
            <div style={{ color: '#C9A227', fontSize: '28px', fontWeight: 'bold' }}>
              Sajjad Husain Law Associates
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '20px' }}>
              www.sajjadhusainlawassociates.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
