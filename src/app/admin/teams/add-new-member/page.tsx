"use client";

import Loader from "@/components/ui/Loader";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function addNewMemberPage(){
  const router = useRouter();
  const { user: reduxUser} = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.replace("/auth/login");
        return;
      }
  
      if (user?.role) {
        const currentRole = user.role.name;
        const allowedRoles = ["admin", "super_admin"];
        if (!allowedRoles.includes(currentRole)) {
          router.replace("/auth/login"); 
        }
        else{
          setIsAuthorized(true)
        }
      }
    }, [user, router]);

   if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Checking Permissions..." />
      </div>
    );
  }

    
    return(
      <h1>hiii</h1>
    )
}