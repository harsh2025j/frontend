"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface judgements {
  img: StaticImageData;
  description:string;
}

const Judgement: React.FC<judgements> = ({
  img,
 description,
}) =>{
return(
    <div className="bg-white  rounded-md shadow-lg overflow-hidden hover:border-blue-300 transition-all duration-300 flex flex-row justify-between border border-gray-200 py-5 gap-5">
    <div className="flex items-center ml-5"><Image src={img} alt="Image" className="w-[50vh] rounded-md"/></div>
    <div className=" mr-3  line-clamp-4 sm:text-base md: text-xs font-merriweather">{description}</div>
    </div>
)
}

export default Judgement;

