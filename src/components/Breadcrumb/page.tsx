"use client";

import { usePathname } from "next/navigation";
// import Link from "next/link";
import { Link } from "@/i18n/routing";

const Breadcrumb = () => {
  const pathname = usePathname();

  const pathParts = pathname.split("/").filter(Boolean);

  const buildPath = (index: number) => {
    return "/" + pathParts.slice(0, index + 1).join("/");
  };

  return (
    <div className="text-sm text-gray-600 flex items-center gap-1">
      <Link href="/" className="hover:underline">
        Home
      </Link>

      {pathParts.map((part, index) => (
        <span key={index} className="flex items-center gap-1">
          <span className="text-gray-400">/</span>

          <Link
            href={buildPath(index)}
            className={`hover:underline capitalize ${index === pathParts.length - 1 ? "font-semibold text-black" : ""
              }`}
          >
            {decodeURIComponent(part.replace(/-/g, " "))}
          </Link>
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
