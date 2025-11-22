import Image, { StaticImageData } from "next/image";
import logo from "../../../public/logo.png";
interface NewsCardProps {
  src?: StaticImageData | string;
  title: string;
  court?: string;
  time?: number;
  veiws?: string;
  likes?: string;
  height?: string;
}
export default function NewsCard({
  src = logo,
  title,
  court,
  time,
  veiws,
  likes,
}: NewsCardProps) {
  return (
    <div
      className={`flex border-1  border-gray-500 flex-col sm:flex-row w-full max-w-[600px]  nsm:max-w-full overflow-hidden bg-[#ffffff] rounded-xl transition-shadow duration-300`}
    >
      <div className="relative w-full sm:w-[180px] h-[200px] sm:h-auto rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none overflow-hidden">
        <Image
          width={300}
          height={200}
          src={
            (typeof src === 'string' && (src.startsWith('http') || src.startsWith('/')))
              ? src
              : (typeof src === 'object' ? src : logo)
          }
          alt={title}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 180px"
        />
      </div>
      <div className=" pt-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-start">
          {court && (
            <span className="text-xs sm:text-sm text-gray-900 bg-gray-300 px-3 py-1 rounded-full font-medium">
              {court}
            </span>
          )}
          {time && (
            <span className="text-xs sm:text-sm text-gray-600">
              {time} mins ago
            </span>
          )}
        </div>

        <div className="px-3 sm:px-4  py-3">
          <p className=" sm:text-sm  font-semibold text-gray-900 leading-snug text-center sm:text-left">
            {title}
          </p>
        </div>
        <div className=" ">
          {veiws && (
            <span className="text-xs sm:text-sm text-gray-900 px-3 py- rounded-full font-medium">
              {veiws}
            </span>
          )}
          {likes && (
            <span className="text-xs sm:text-sm text-gray-600">
              {likes}
              Likes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
