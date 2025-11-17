"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface HindiNews {
  img: StaticImageData;
  title:string;
  description:string;
}

const HindiNews:React.FC<HindiNews>=({
    img,
    title,
    description
})=>{
return(
    <div className="bg-white rounded-xl shadow-md sm:py-6 py-2 px-10 flex flex-row gap-6 items-start w-full h-auto transition-all duration-300 hover:border-blue-300 border-1 my-5">
        <div className="w-[25%] ">
            <Image src={img} alt="Image" className="sm:w-full h-30 sm:h-50  object-cover rounded-lg"/>
        </div>
        <div className="flex flex-col justify-between w-[90%]">
            <h1 className="pt-3 font-merriweather sm:text-2xl text-base font-semibold line-clamp-1 sm:line-clamp-2">{title}</h1>
            <p className="font-merriweather text-gray-700 text-xs line-clamp-2 sm:line-clamp-4 mt-5 sm:mt-10">{description}</p>
        </div>
    </div>
)
}

export default HindiNews;