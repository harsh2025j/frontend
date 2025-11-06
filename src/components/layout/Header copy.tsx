// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Menu, X } from "lucide-react";
// import Image from "next/image";
// import logo from "../../../public/logo.svg";
// import { useAppSelector, useAppDispatch } from "@/redux/hooks";
// import { resetAuthState } from "@/data/features/auth/authSlice";

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { user, token } = useAppSelector((state) => state.auth);
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     if (menuOpen) document.body.classList.add("overflow-hidden");
//     else document.body.classList.remove("overflow-hidden");
//   }, [menuOpen]);

//   const handleLinkClick = () => setMenuOpen(false);

//   const navLinks = [
//     "Home",
//     "Latest News",
//     "Judgments",
//     "Interviews",
//     "Explainers",
//     "Business",
//     "Innovation",
//     "More ▾",
//   ];

//   return (
//     <header className="w-full border-b border-gray-200 bg-white z-50">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
//         {/* Logo */}
//         <Link href="/" className="flex items-center" onClick={handleLinkClick}>
//           <Image
//             src={logo}
//             alt="Logo"
//             className="object-contain"
//             width={140}
//             height={40}
//             priority
//           />
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-8 text-base font-medium">
//           {navLinks.map((label, i) => (
//             <Link href="#" key={i} className="hover:text-black/70">
//               {label}
//             </Link>
//           ))}
//         </nav>

//         {/* Desktop Auth / User */}
//         <div className="hidden md:flex items-center gap-4">
//           {token && user ? (
//             <>
//               <span className="text-gray-800 font-medium">
//                 Hi, {user.name || user.email}
//               </span>
//               <button
//                 onClick={() => dispatch(resetAuthState())}
//                 className="rounded-full border border-black text-black px-5 py-2 hover:bg-black hover:text-white text-sm font-medium"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link href="/auth/signin">
//                 <button className="rounded-full bg-black text-white px-5 py-2 hover:opacity-80 text-sm font-medium">
//                   Sign in
//                 </button>
//               </Link>
//               <Link href="/auth/signup">
//                 <button className="rounded-full border border-black text-black px-5 py-2 hover:bg-black hover:text-white text-sm font-medium">
//                   Sign up
//                 </button>
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Mobile Menu Toggle */}
//         <div className="md:hidden">
//           <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
//             {menuOpen ? <X size={28} /> : <Menu size={28} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu Overlay */}
//       <div
//         className={`md:hidden fixed top-0 left-0 w-full h-full bg-white transform transition-transform duration-300 ease-in-out z-40 ${
//           menuOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="px-6 pt-20 pb-6 flex flex-col justify-between h-full overflow-y-auto">
//           <nav className="flex flex-col gap-6 text-lg font-medium">
//             {navLinks.map((label, i) => (
//               <Link
//                 href="#"
//                 key={i}
//                 onClick={handleLinkClick}
//                 className="hover:text-black/70"
//               >
//                 {label}
//               </Link>
//             ))}
//           </nav>

//           {/* Mobile Auth / User */}
//           <div className="flex flex-col gap-4 mt-8">
//             {token && user ? (
//               <>
//                 <span className="text-lg font-medium text-center">
//                   Hi, {user.name || user.email}
//                 </span>
//                 <button
//                   onClick={() => {
//                     dispatch(resetAuthState());
//                     handleLinkClick();
//                   }}
//                   className="w-full rounded-full border border-black px-6 py-3 font-medium hover:bg-black hover:text-white"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link href="/auth/signin" onClick={handleLinkClick}>
//                   <button className="w-full rounded-full bg-black px-6 py-3 text-white font-medium hover:opacity-80">
//                     Sign in
//                   </button>
//                 </Link>
//                 <Link href="/auth/signup" onClick={handleLinkClick}>
//                   <button className="w-full rounded-full border border-black px-6 py-3 font-medium hover:bg-black hover:text-white">
//                     Sign up
//                   </button>
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
