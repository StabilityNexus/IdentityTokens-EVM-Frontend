import React from "react";
import Image from "next/image";

interface FeatureCardProps {
  bgImage: string;
  title: string;
  textColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  bgImage,
  title,
  textColor = "text-white",
}) => {
  return (
    <div className="relative h-[380px] w-[85vw] flex-shrink-0 overflow-hidden rounded-2xl select-none md:h-[624px] md:w-[466px]">
      {/* Background Image */}
      <Image
        src={bgImage}
        alt={title}
        fill
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Title Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <h3
          className={`${textColor} mt-6 mr-6 ml-6 font-utsaha text-2xl leading-tight whitespace-pre-line md:mt-[17px] md:mr-[85px] md:ml-[32px] md:text-[45px] md:leading-[1.13]`}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};

export default FeatureCard;
