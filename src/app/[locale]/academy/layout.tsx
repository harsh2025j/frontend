import React from 'react';
import './academy.css';
import AcademyWrapper from './components/AcademyWrapper';

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AcademyWrapper>{children}</AcademyWrapper>;
}

