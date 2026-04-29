import { ImageResponse } from 'next/og';
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import sharp from 'sharp';

export const alt = 'News Article Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const logoDataPromise = fetch(
  new URL('../../../../../public/logo-gold.png', import.meta.url)
).then((res) => res.arrayBuffer()).catch(() => null);

export default async function Image({ params }: { params: { slug: string; locale: string } }) {
  const { slug } = await params;
  const logoData = await logoDataPromise;

  let articleTitle = "Legal News";
  let thumbnailSrc: any = logoData;
  let categoryName = "Legal Updates";
  let useFallback = true;

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
        if (article.category?.name) {
          categoryName = article.category.name;
        }

        if (article.thumbnail) {
          try {
            const imgRes = await fetch(article.thumbnail);
            const contentType = imgRes.headers.get('content-type') || '';

            if (imgRes.ok) {
              const imgArrayBuffer = await imgRes.arrayBuffer();
              const isWebp = article.thumbnail.toLowerCase().includes('.webp') || contentType.includes('webp');

              if (isWebp) {
                // Convert WebP to PNG using sharp so Satori can render it!
                const pngBuffer = await sharp(imgArrayBuffer).png().toBuffer();
                // Convert Node Buffer back to standard ArrayBuffer for Satori
                thumbnailSrc = new Uint8Array(pngBuffer).buffer;
                useFallback = false;
              } else {
                thumbnailSrc = imgArrayBuffer;
                useFallback = false;
              }
            }
          } catch (imgErr) {
            console.error("Failed to fetch/convert image", imgErr);
          }
        }
      }
    }
  } catch (error) {
    console.error("OG Image Error:", error);
  }

  const satoriResponse = new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: '#fff',
          position: 'relative',
        }}
      >
        <img
          src={thumbnailSrc}
          alt={articleTitle}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: useFallback ? 'contain' : 'cover',
            backgroundColor: useFallback ? '#1a1a1a' : 'transparent',
            padding: useFallback ? '100px' : '0',
          }}
        />

        {/* Subtle bottom gradient just to ensure the URL watermark is readable */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '120px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Hardcoded URL Watermark at the bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '40px',
            display: 'flex',
          }}
        >
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '28px',
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            www.sajjadhusainlawassociates.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );

  // Read the raw uncompressed PNG buffer constructed by Satori
  const rawPngBuffer = await satoriResponse.arrayBuffer();

  // Compress it heavily using Sharp into a JPEG to bypass WhatsApp's rigid 300KB limit
  const jpegBuffer = await sharp(rawPngBuffer).jpeg({ quality: 75 }).toBuffer();

  return new Response(jpegBuffer as any, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
