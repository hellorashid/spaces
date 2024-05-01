import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getFunctionName(jsCode: string): string | null {
  const pattern = /function (\w+)/;
  const match = jsCode.match(pattern);
  return match ? match[1] : null;
}