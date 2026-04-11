"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface State {
  img: StaticImageData | string;
  state: string;
}

const StateJudgement: React.FC<State> = ({ img, state }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="
        w-14 h-14
        sm:w-16 sm:h-16
        md:w-20 md:h-20
        lg:w-24 lg:h-24
        rounded-full overflow-hidden
      ">
        <Image
          src={img}
          alt="Image"
          className="object-cover w-full h-full"
          width={100}
          height={100}
          quality={90}
        />
      </div>

      <h1 className="
        text-xs 
        sm:text-sm 
        md:text-base 
        text-center mt-2
      ">
        {state}
      </h1>
    </div>
  );
};

export default StateJudgement;
