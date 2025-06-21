"use client";

import { useState, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function LogIn() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  // Debounced input handler to reduce state updates
  const debouncedSetFormData = useMemo(
    () =>
      debounce((name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }, 300),
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetFormData(e.target.name, e.target.value);
    },
    [debouncedSetFormData]
  );

  // Determine login endpoint based on ID prefix
  const getLoginEndpoint = (identifier: string): string | null => {
    if (!identifier) return null;
    const prefix = identifier.trim().toUpperCase();
    if (prefix.startsWith("GV - AA -")) return "/api/admins/login";
    if (prefix.startsWith("GV - CC -")) return "/api/caregivers/login";
    if (prefix.startsWith("GV - PT -")) return "/api/patients/login";
    return null;
  };

  const getLoginPayload = () => {
    const { identifier, password } = formData;
    return { username: identifier, password };
  };

  const setCookie = (name: string, value: string, days = 1) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setShowDialog(false);

    const identifier = formData.identifier?.trim();
    const password = formData.password?.trim();

    if (!identifier || !password) {
      setError("Both identifier and password are required.");
      setShowDialog(true);
      return;
    }

    const endpoint = getLoginEndpoint(identifier);

    if (!endpoint) {
      setError("Invalid identifier format. Use e.g. GV - AA - 1.");
      setShowDialog(true);
      return;
    }

    const payload = getLoginPayload();

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // important for cookie-based sessions
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || "Login failed");
      }

      const result = await response.json();
      const role = result.role?.toLowerCase();

      // Save username and userId (last digit of identifier)
      const userId = identifier.split("-").pop()?.trim();
      setCookie("username", identifier);
      setCookie("userId", userId || "");

      // Redirect based on role
      switch (role) {
        case "admin":
          router.push("/pages/admin");
          break;
        case "caregiver":
          router.push("/pages/caregiver");
          break;
        case "patient":
          router.push("/pages/patient");
          break;
        default:
          throw new Error("Unknown role");
      }
    } catch (err: any) {
      setError(err.message || "Login error");
      setShowDialog(true);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
        <Card className="w-full max-w-md p-4">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form onSubmit={handleSubmit}>
              <Input
                placeholder="Username or Identifier (e.g., GV - AA - 1)"
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
              <Button type="submit" className="w-full mt-2">
                Login
              </Button>
            </form>
            <p className="mt-4 text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link href="/pages/registration" className="text-blue-600 underline">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Failed</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
