import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime12HourIST(timeStr?: string): string {
  if (!timeStr) return "TBD";
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes("AM") || trimmed.toUpperCase().includes("PM")) {
    return trimmed.toUpperCase().includes("IST") ? trimmed : `${trimmed} IST`;
  }

  const parts = trimmed.split(":");
  if (parts.length < 2) return `${trimmed} IST`;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, "0");

  if (isNaN(hours)) return `${trimmed} IST`;

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedHours = hours.toString().padStart(2, "0");
  return `${formattedHours}:${minutes} ${period} IST`;
}

