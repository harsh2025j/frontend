"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
import { Stardos_Stencil } from "next/font/google";

interface State{
    img:StaticImageData;
    state:string;
}

const StateJudgement:React.FC<State>=({
    img,
    state,
})=>{
    return(
        <div className="md:w-auto">
            <Image src={img} alt="Image" className="rounded-[50%]"/>
            <h1 className="text-md text-center">{state}</h1>
        </div>
    )
}

export default StateJudgement;