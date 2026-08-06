import { ImageResponse } from 'next/og';
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";

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
            // Using a free edge caching proxy (wsrv.nl) to convert WebP to JPEG on the fly
            // because Satori does not support WebP, and Cloudflare Workers cannot run 'sharp'.
            const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(article.thumbnail)}&output=jpeg&q=80&w=1200`;
            const imgRes = await fetch(proxyUrl);

            if (imgRes.ok) {
              thumbnailSrc = await imgRes.arrayBuffer();
              useFallback = false;
            }
          } catch (imgErr) {
            console.error("Failed to fetch/convert image via proxy", imgErr);
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

  return satoriResponse;
}
