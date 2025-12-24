'use client'
import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';

interface Judge {
    id: number;
    name: string;
    designation: string;
    court: string;
    image?: StaticImageData | string;
}

export default function TopJudgesSection() {
    const [judges] = useState<Judge[]>([


    ]);

    const hasJudges = judges.length > 0;

    return (
        <div className="flex flex-col gap-3 md:gap-4 w-full lg:flex-1">
            <div className="flex justify-between items-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-merriweather text-[#0A2342]">
                    Top Judges
                </h1>
            </div>

            <div className="flex flex-col p-4 sm:p-5 bg-white justify-evenly transition-all duration-300 rounded-lg shadow-md h-full gap-3">
                {hasJudges ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {judges.map((judge) => (
                            <div
                                key={judge.id}
                                className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#C9A227] transition-colors"
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {judge.image ? (
                                        <Image
                                            src={judge.image}
                                            alt={judge.name}
                                            width={64}
                                            height={64}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{judge.name}</h3>
                                    <p className="text-sm text-gray-600">{judge.designation}</p>
                                    <p className="text-xs text-gray-500">{judge.court}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                            Top Judges Information
                        </h3>
                        <p className="text-sm text-gray-600">
                            We are currently collecting data about top judges to display here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
