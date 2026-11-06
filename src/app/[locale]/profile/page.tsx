"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import Loader from "@/components/ui/Loader";

export default function ProfileRedirectPage() {
    const router = useRouter();
    const { user, loading } = useProfileActions();

    useEffect(() => {
        if (loading) return;

        if (user?.username) {
            router.replace(`/profile/${user.username}`);
        } else {
            // Check localStorage fallback
            try {
                const storedUsername = localStorage.getItem("username");
                if (storedUsername) {
                    router.replace(`/profile/${storedUsername}`);
                    return;
                }
            } catch {}
            router.replace("/");
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader />
        </div>
    );
}
