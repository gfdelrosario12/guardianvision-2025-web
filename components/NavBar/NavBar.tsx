"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface NavBarProps {
  isOnline: boolean;
}

export default function Navbar({ isOnline }: NavBarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"admin" | "caregiver" | "patient" | null>(null);

  useEffect(() => {
    setMounted(true);

    // Log all cookies
    console.log("All cookies:", document.cookie);

    const cookies = document.cookie
      .split("; ")
      .reduce<Record<string, string>>((acc, curr) => {
        const [key, val] = curr.split("=");
        acc[key] = decodeURIComponent(val); // decode for spaces or special characters
        return acc;
      }, {});

    const username = cookies["username"];
    console.log("username cookie:", username);

    if (username) {
      if (username.includes("GV - AA")) {
        console.log("Detected role: admin");
        setRole("admin");
      } else if (username.includes("GV - CC")) {
        console.log("Detected role: caregiver");
        setRole("caregiver");
      } else if (username.includes("GV - PT")) {
        console.log("Detected role: patient");
        setRole("patient");
      } else {
        console.log("Unknown role in username");
        setRole(null);
      }
    } else {
      console.log("No username cookie found");
      setRole(null);
    }
  }, []);


  const clearCookies = () => {
    document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const handleLogout = () => {
    clearCookies();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Map role to dashboard path
const dashboardPath =
  role === "admin" ? "/pages/admin" :
  role === "caregiver" ? "/pages/caregiver" :
  role === "patient" ? "/pages/patient" :
  "/";

  return (
    <nav className="relative w-full bg-black py-4 px-6 flex items-center justify-between shadow-md">
      {/* Left: Dark/Light toggle */}
      <div className="w-[120px]">
        {mounted && (
          <Button
            onClick={toggleTheme}
            variant="ghost"
            className="border border-white text-white hover:bg-white hover:text-black"
            aria-label="Toggle Dark Mode"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        )}
      </div>

      {/* Center: Title */}
      <div className="flex-1 text-center font-bold text-xl text-white">
        {/* Link href changes depending on role */}
        <Link href={dashboardPath}>Guardian Vision</Link>
      </div>

      {/* Right: Logout button */}
      <div className="w-[120px] flex justify-end">
        {isOnline && (
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="border border-white text-white hover:bg-white hover:text-black"
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
