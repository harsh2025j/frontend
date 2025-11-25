"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface HindiNews {
  img: StaticImageData | string ;
  title:string;
  description:string;
  slug:string;
}

const HindiNews:React.FC<HindiNews>=({
    img,
    title,
    description,
    slug,
})=>{
return(
   <div className="bg-white rounded-xl shadow-md sm:py-6 py-2 px-10 flex flex-row gap-6 justify-between w-full h-auto transition-all duration-300 hover:border-blue-300 border-1 my-5">

  {/* Left - Image */}
  <Link href={`/news/${slug}`} className="w-[25%]">
    <div className="relative h-[120px] sm:h-[160px] w-full">
      <Image
        src={img}
        alt="Image"
        fill
        className="object-cover rounded-lg"
      />
    </div>
  </Link>

  <div className="flex flex-col  w-[75%]">
  <Link href={`/news/${slug}`}>
    <h1 className="pt-3 font-merriweather sm:text-2xl text-base font-semibold line-clamp-1 sm:line-clamp-2">
      {title}
    </h1>
  </Link>

  <div
    className="font-merriweather text-gray-700 text-xs line-clamp-3 sm:line-clamp-5 mt-4"
    dangerouslySetInnerHTML={{ __html: description }}
  />
</div>


</div>

)
}

export default HindiNews;