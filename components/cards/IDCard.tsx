import Image from "next/image";
import {
  FaTelegramPlane,
  FaLinkedinIn,
  FaGithub,
  FaDiscord,
} from "react-icons/fa";
import Badge from "../Badge";
import { IDCardProps } from "@/lib/types";

const getRankFromEndorsers = (
  count: number
): "bronze" | "silver" | "gold" | "platinum" | "diamond" | "champion" => {
  if (count < 10) return "bronze";
  if (count < 50) return "silver";
  if (count < 100) return "gold";
  if (count < 500) return "platinum";
  if (count < 1000) return "diamond";
  return "champion";
};

const IDCard: React.FC<IDCardProps> = ({
  name = "Khushal Agarwal",
  age = 20,
  nationality = "Indian",
  walletAddress = "0x9cea81B9D2E900..",
  endorsers = 128,
  className = "",
  telegramUrl,
  linkedinUrl,
  githubUrl,
  discordUrl,
}) => {
  return (
    <div
      className={`relative h-[280px] w-full max-w-[450px] sm:h-[320px] sm:max-w-[500px] md:h-[340px] md:max-w-[542px] lg:h-[220px] lg:w-[340px] lg:min-w-[340px] ${className}`}
      data-name="IDCard"
    >
      {/* Card Background with Glassmorphism */}
      <div className="absolute inset-0 rounded-[24px] border border-white/50 bg-brand-blue/93 shadow-[11px_13px_22px_0px_rgba(0,0,0,0.05)] backdrop-blur-[7.6px] sm:rounded-[28px] md:rounded-[33px] lg:rounded-[12px]" />

      {/* Name Section */}
      <div className="absolute top-[42px] right-[180px] left-[20px] sm:top-[48px] sm:right-[220px] sm:left-[30px] md:top-[54px] md:right-[270px] md:left-[40px] lg:top-[36px] lg:right-[160px] lg:left-[18px]">
        <p className="mb-0.5 font-comfortaa text-[8px] font-normal text-black sm:text-[9px] md:mb-1 md:text-[9.5px] lg:mb-0.5 lg:text-[8px]">
          Name
        </p>
        <p
          className="max-w-full truncate font-utsaha text-[20px] leading-tight text-white sm:text-[24px] md:text-[26.5px] lg:text-[20px]"
          title={name}
        >
          {name}
        </p>
        <p
          className="mt-0.5 max-w-full truncate font-comfortaa text-[7.5px] font-normal text-black sm:text-[8.5px] md:mt-1 md:text-[9.2px] lg:mt-0.5 lg:text-[7.5px]"
          title={walletAddress}
        >
          {walletAddress}
        </p>
      </div>

      {/* Age Section */}
      <div className="absolute top-[125px] left-[20px] sm:top-[118px] sm:left-[30px] md:top-[130px] md:left-[40px] lg:top-[106px] lg:left-[18px]">
        <p className="mb-0.5 font-comfortaa text-[8px] font-normal text-black sm:text-[9px] md:mb-1 md:text-[9.5px] lg:mb-0.5 lg:text-[8px]">
          Age
        </p>
        <p className="font-utsaha text-[20px] leading-tight text-white sm:text-[24px] md:text-[26.5px] lg:text-[20px]">
          {age}
        </p>
      </div>

      {/* Nationality Section */}
      <div className="absolute top-[125px] left-[90px] sm:top-[118px] sm:left-[110px] md:top-[130px] md:left-[130px] lg:top-[106px] lg:left-[84px]">
        <p className="mb-0.5 font-comfortaa text-[8px] font-normal text-black sm:text-[9px] md:mb-1 md:text-[9.5px] lg:mb-0.5 lg:text-[8px]">
          Nationality
        </p>
        <p className="font-utsaha text-[20px] leading-tight text-white sm:text-[24px] md:text-[26.5px] lg:text-[20px]">
          {nationality}
        </p>
      </div>

      {/* Rank Badge */}
      <div className="absolute top-[50px] right-[35px] flex flex-col items-center sm:top-[58px] sm:right-[42px] md:top-[64px] md:right-[51px] lg:top-[44px] lg:right-[30px]">
        <Badge
          rank={getRankFromEndorsers(endorsers)}
          size={48}
          className="sm:h-[52px] sm:w-[52px] md:h-[57px] md:w-[57px] lg:h-[44px] lg:w-[44px]"
        />
        <p className="mt-0.5 font-utsaha text-[11px] text-white sm:text-[12px] md:mt-1 md:text-[13px] lg:mt-0.5 lg:text-[11px]">
          Endorsers
        </p>
        <p className="font-utsaha text-[15px] text-white sm:text-[16px] md:text-[17.7px] lg:text-[16px]">
          {endorsers}
        </p>
      </div>

      {/* Bottom Row: Social Icons and DIT Logo */}
      <div className="absolute right-[28px] bottom-[20px] left-[28px] flex items-center justify-between sm:right-[32px] sm:bottom-[24px] sm:left-[32px] md:right-[37px] md:bottom-[27px] md:left-[37px] lg:right-[22px] lg:bottom-[18px] lg:left-[22px]">
        {/* Social Icons */}
        <div className="flex gap-2.5 sm:gap-3 md:gap-4 lg:gap-2.5">
          {telegramUrl ? (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram profile"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaTelegramPlane className="h-full w-full" />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaTelegramPlane className="h-full w-full" />
            </span>
          )}
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaLinkedinIn className="h-full w-full" />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaLinkedinIn className="h-full w-full" />
            </span>
          )}
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaGithub className="h-full w-full" />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaGithub className="h-full w-full" />
            </span>
          )}
          {discordUrl ? (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord profile"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaDiscord className="h-full w-full" />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center text-black transition-colors hover:text-gray-700 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-4.5 lg:w-4.5"
            >
              <FaDiscord className="h-full w-full" />
            </span>
          )}
        </div>

        {/* DIT Logo */}
        <div className="flex items-center gap-1">
          <Image
            src="/assets/logo.svg"
            alt="DIT Logo"
            width={16}
            height={16}
            className="h-4 w-4 brightness-0 sm:h-3.5 sm:w-3.5 md:h-5 md:w-5 lg:h-4.5 lg:w-4.5"
          />
          <span className="font-atyp text-[16px] font-bold text-black sm:text-[17px] md:text-[18px] lg:text-[16px]">
            dit
          </span>
        </div>
      </div>
    </div>
  );
};

export default IDCard;
