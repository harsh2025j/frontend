"use client";

import React from "react";
import { useAppSelector } from "@/data/redux/hooks";
import Loader from "./Loader";

export default function GlobalLoader() {
    const { isLoading } = useAppSelector((state) => state.ui);

    if (!isLoading) return null;

    return <Loader fullScreen={true} text="Loading..." />;
}
