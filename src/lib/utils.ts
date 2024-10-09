import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTimestamp = (): string => {
  return new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
};
