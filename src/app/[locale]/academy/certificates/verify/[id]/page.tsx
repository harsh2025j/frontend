import { Metadata } from 'next';
import CertificateVerifyClient from './CertificateVerifyClient';
import { certificateApi, VerifyResult, normalizeCertificateId } from '@/data/services/academy-service/certificate.service';

interface Props {
  params: Promise<{ id: string; locale: string }> | { id: string; locale: string };
}

async function getCertificate(id: string): Promise<VerifyResult | null> {
  if (!id) return null;
  try {
    const res = await certificateApi.verify(id);
    return res;
  } catch {
    return { status: 'not_found' };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams.id;
  const certId = normalizeCertificateId(decodeURIComponent(rawId || ''));

  const data = await getCertificate(certId);
  const cert = data?.status === 'valid' ? data.certificate : null;

  if (!cert) {
    return {
      title: `Verify Certificate - ${certId}`,
      description: 'Official digital certificate verification for Sajjad Husain Legal Academy.',
    };
  }

  const title = `Certificate of Completion - ${cert.studentName}`;
  const description = `Verified Certificate of Completion for "${cert.courseName}" issued to ${cert.studentName} by ${cert.platformName || 'Sajjad Husain Legal Academy'}. Credential ID: ${cert.certificateId}`;
  const imageUrl = cert.imageUrl || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 848,
              alt: `Certificate of Completion for ${cert.studentName}`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function CertificateVerificationDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams.id;
  const normalizedId = normalizeCertificateId(decodeURIComponent(rawId || ''));
  const initialResult = await getCertificate(normalizedId);

  return <CertificateVerifyClient initialResult={initialResult} rawId={normalizedId} />;
}
