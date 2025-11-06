// "use client";

// import Image from "next/image";
// import logo from "../../../../public/logo.svg";
// import CustomInput from "@/components/ui/CustomInput";
// import { useVerifyActions } from "@/data/features/auth/useAuthActions";

// export default function VerifyPage() {
//   const { formData, handleChange, handleVerify, loading, error, message } =
//     useVerifyActions();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     handleVerify();
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
//       <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row bg-white">
//         <div className="w-full lg:w-1/2 bg-[#ffffff] border px-6 sm:px-10 py-10">
//           <h2 className="text-2xl font-semibold text-center mb-4">
//             Verify Your Account
//           </h2>
//           <p className="text-sm text-gray-600 text-center mb-8">
//             Enter the 6-digit verification code sent to your email address.
//           </p>

         

//           <form onSubmit={handleSubmit} className="space-y-4 px-6 sm:px-14">
//              <CustomInput
//               label="Email"
//               name="email"
//               type="email"
//               placeholder="example@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
            
//             <CustomInput
//               label="Verification Code (OTP)"
//               name="otp"
//               type="text"
//               placeholder="Enter 6-digit code"
//               value={formData.otp}
//               onChange={handleChange}
//               required
//             />

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
//             >
//               {loading ? "Verifying..." : "Verify"}
//             </button>
//           </form>

//           {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
//           {message && (
//             <p className="text-green-600 text-sm mt-3 text-center">{message}</p>
//           )}
//         </div>

//         <div className="w-full lg:w-1/2 bg-[#0A2342] flex flex-col justify-center px-6 py-10">
//           <div className="flex justify-center mb-6">
//             <Image
//               src={logo}
//               alt="Logo"
//               width={300}
//               height={300}
//               className="rounded-full w-48 h-48 object-contain sm:w-60 sm:h-60 bg-white"
//               priority
//             />
//           </div>

//           <h3 className="text-xl text-white text-center mb-4">Almost there!</h3>
//           <p className="text-sm text-white text-center px-4 sm:px-10 lg:px-24">
//             You’re one step away from accessing premium legal updates and insights.
//             Verify your account to continue exploring India’s trusted legal news
//             platform.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
