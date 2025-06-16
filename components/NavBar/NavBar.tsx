"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const [status, setStatus] = useState("online"); // or "offline"

  return (
    <nav className="w-full bg-black py-4 px-6 flex justify-between items-center shadow-md">
      {/* Left Side */}
      <div className="flex-1">
        {status === "online" && (
          <Button
            variant="ghost"
            className="border border-white text-white hover:bg-white hover:text-black"
          >
            Settings
          </Button>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 text-center font-bold text-xl text-white">
        <Link href="/">Guardian Vision</Link>
        
      </div>

      {/* Right Side */}
      <div className="flex-1 flex justify-end">
        {status === "online" && (
          <Button
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
