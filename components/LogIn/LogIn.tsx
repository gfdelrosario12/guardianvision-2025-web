"use client"

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LogIn() {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ formData });
    // Handle login API call here, role inferred from backend
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
      <Card className="w-full max-w-md p-4">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            <Input
              placeholder="Email or Username"
              name="identifier"
              onChange={handleChange}
              className="mb-2"
            />
            <Input
              placeholder="Password"
              name="password"
              type="password"
              onChange={handleChange}
              className="mb-2"
            />
            <Button type="submit" className="w-full mt-2"><Link href="/pages/admin">Login</Link></Button>
          </form>
          <p className="mt-4 text-sm text-center">
            Don&apos;t have an account?{' '}
            <Link href="/pages/registration" className="text-blue-600 underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
