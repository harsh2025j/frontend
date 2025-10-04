// components/ui/NewsCard.jsx
import Image from "next/image";
import logo from '../../../public/logo.svg'

export default function NewsCard({ src = logo, title, height = "h-[103px]" }) {
  return (
    <div className={`flex  ${height} w-[403px] overflow-hidden bg-[#D9D9D9]` }>
      
   
      <div className="relative bg-pink-200 rounded-lg w-[170px] h-[103px]">
        <Image
          src={logo}
          alt={title}
          fill
          className="object-cover rounded-r-lg"
        />
      </div>
      <div className="flex-1 p-3 flex items-center">
        <p className="text-sm font-medium text-gray-800">{title}</p>
      </div>

      
    </div>
  );
}
