"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogIn from "@/components/LogIn/LogIn";
import NavBar from "@/components/NavBar/NavBar";

export default function Home() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse cookies
    const cookies = document.cookie.split("; ").reduce((acc, curr) => {
      const [key, value] = curr.split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const username = cookies["username"];
    const role = cookies["role"]; // assuming you save user role in cookie on login

    if (username && role) {
      setIsOnline(true);

      // Redirect based on role
      if (role === "admin") {
        router.replace("/admin");
      } else if (role === "caregiver") {
        router.replace("/caregiver");
      } else if (role === "patient") {
        router.replace("/patient");
      } else {
        // unknown role, fallback to login page (stay here)
        setIsOnline(false);
      }
    } else {
      // Not logged in
      setIsOnline(false);
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    // Prevent flicker before redirect or showing login
    return null; // or a spinner component
  }

  return (
    <div>
      <NavBar isOnline={isOnline} />
      {!isOnline && <LogIn />}
      {/* No need to render anything else because logged in users get redirected */}
    </div>
  );
}
