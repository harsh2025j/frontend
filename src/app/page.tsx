import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto">
      {/* Breaking News Banner */}
      <div className="py-6 flex justify-center">
        <div className="bg-red-600 text-white text-base md:text-md flex items-center justify-center rounded-md w-full max-w-5xl h-auto min-h-[50px] text-center">
          <p>
            <span className="font-bold">BREAKING NEWS</span> | Madras High Court
            has rejected the anticipatory bail petition of TVK district
            secretary Satish Kumar.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Big Card */}
        <div className="bg-amber-100 rounded-lg p-4 flex flex-col">
          <div className="relative w-full h-48 md:h-64 rounded-md overflow-hidden">
            <Image
              src="/sample.jpg" // replace with your image
              alt="News Thumbnail"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="mt-4 font-semibold text-lg md:text-xl">
            Jobs, travel, national parks - what impact will US shutdown have?
          </h3>
          <p className="mt-2 text-sm md:text-base text-gray-700">
            Washington's political gridlock could inflict wide-ranging miseries,
            as anything deemed non-essential will be put on hold.
          </p>
        </div>

        {/* Right News Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Column */}
          <div className="flex flex-col gap-4">
            <div className="bg-pink-200 rounded-lg h-[100px] sm:h-[120px] md:h-[150px]">
              <Image
                src="/sample.jpg" // replace with your image
                alt="News Thumbnail"
                fill
                className="object-cover"
              />
              <p>Supreme Court Half Yearly Digest 2025: Family Law</p>
            </div>
            <div className="bg-pink-200 rounded-lg h-[100px] sm:h-[120px] md:h-[150px]">
              <Image
                src="/sample.jpg" // replace with your image
                alt="News Thumbnail"
                fill
                className="object-cover"
              />
              <p>Supreme Court Half Yearly Digest 2025: Family Law</p>
            </div>
            <div className="bg-pink-200 rounded-lg h-[100px] sm:h-[120px] md:h-[150px]">
              <Image
                src="/sample.jpg" // replace with your image
                alt="News Thumbnail"
                fill
                className="object-cover"
              />
              <p>Supreme Court Half Yearly Digest 2025: Family Law</p>
            </div>
          </div>

          {/* Second Column */}
          <div className="flex flex-col gap-4">
            <div className="bg-pink-200 rounded-lg h-[100px] sm:h-[120px] md:h-[150px]">
              <Image
                src="/sample.jpg" // replace with your image
                alt="News Thumbnail"
                fill
                className="object-cover"
              />
              <p>Supreme Court Half Yearly Digest 2025: Family Law</p>
            </div>
            <div className="bg-pink-200 rounded-lg h-[100px] sm:h-[120px] md:h-[150px]">
              <div className="flex">
                <Image
                src="/sample.jpg" // replace with your image
                alt="News Thumbnail"
                fill
                className="object-cover h-[100px] n"
              />
              <p>Supreme Court Half Yearly Digest 2025: Family Law</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
