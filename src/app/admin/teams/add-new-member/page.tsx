"use client";

import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function addNewMemberPage(){
  const router = useRouter();
  const { user: reduxUser} = useProfileActions();
    const user = reduxUser as UserData;
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
      }
    }, [user, router]);

    
    return(
      <h1>hiii</h1>
    )
}