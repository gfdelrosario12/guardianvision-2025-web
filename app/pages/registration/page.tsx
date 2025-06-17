"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import NavBar from "@/components/NavBar/NavBar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog), { ssr: false });
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent), { ssr: false });
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle), { ssr: false });
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogDescription), { ssr: false });

export default function RegistrationForm() {
  const [role, setRole] = useState("admin");
  const [formData, setFormData] = useState<Record<string, any>>({
    caregiver: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [caregivers, setCaregivers] = useState<{ id: number; first_name: string; last_name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (role === "patient") {
      fetch("http://localhost:8080/api/caregivers")
        .then((res) => res.json())
        .then((data) => setCaregivers(data))
        .catch((err) => console.error("Failed to fetch caregivers:", err));
    }
  }, [role]);

  const validateField = useCallback((name: string, value: string) => {
    let error = "";
    switch (name) {
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = "Valid email is required";
        break;
      case "password":
        if (value.length < 6) error = "Password must be at least 6 characters";
        break;
      case "firstName":
        if (!value) error = "First name is required";
        break;
      case "lastName":
        if (!value) error = "Last name is required";
        break;
      case "address":
        if (!value) error = "Address is required";
        break;
      case "gender":
        if (!value) error = "Gender is required";
        break;
      case "mobile_number":
        if (!/^\d+$/.test(value)) error = "Valid mobile number is required";
        break;
      case "age":
      case "height":
      case "weight":
        if (role === "patient" && (!value || Number(value) <= 0)) error = `Valid ${name} is required`;
        break;
      case "emergency_contact_name":
      case "emergency_contact_address":
        if (role === "patient" && !value) error = `${name.replace(/_/g, ' ')} is required`;
        break;
      case "emergency_contact_number":
        if (role === "patient" && !/^\d+$/.test(value)) error = "Valid emergency contact number is required";
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [role]);

  const debouncedValidateField = useMemo(() => debounce(validateField, 300), [validateField]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    debouncedValidateField(name, value);
  }, [debouncedValidateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  }, [validateField]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key, value);
      if (errors[key]) newErrors[key] = errors[key];
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const endpointMap: Record<string, string> = {
      admin: "/api/admins",
      caregiver: "/api/caregivers",
      patient: "/api/patients",
    };

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080${endpointMap[role]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Registration failed");

      const result = await response.json();
      setGeneratedUsername(result.username);
      setShowDialog(true);
    } catch (error) {
      alert("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, role]);

  const renderError = (field: string) =>
    errors[field] && <p className="text-red-500 text-sm mb-1">{errors[field]}</p>;

  const commonFields = (
    <>
      <Input name="email" placeholder="Email" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("email")}

      <Input name="password" placeholder="Password" type="password" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("password")}

      <div className="flex gap-2 mb-1">
        <Input name="firstName" placeholder="First Name" onChange={handleChange} onBlur={handleBlur} className="w-1/3" />
        <Input name="middleName" placeholder="Middle Name" onChange={handleChange} className="w-1/3" />
        <Input name="lastName" placeholder="Last Name" onChange={handleChange} onBlur={handleBlur} className="w-1/3" />
      </div>
      {renderError("firstName")}
      {renderError("lastName")}

      <Input name="address" placeholder="Address" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("address")}

      <Select
        value={formData.gender || ""}
        onValueChange={(val) => {
          setFormData(prev => ({ ...prev, gender: val }));
          setErrors(prev => ({ ...prev, gender: "" }));
        }}
      >
        <SelectTrigger className="w-full mb-1">
          <SelectValue placeholder="Select Sex" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Male">Male</SelectItem>
          <SelectItem value="Female">Female</SelectItem>
        </SelectContent>
      </Select>
      {renderError("gender")}

      <Input name="mobile_number" placeholder="Mobile Number" type="number" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("mobile_number")}
    </>
  );

  const patientFields = role === "patient" && (
    <>
      <Input name="age" placeholder="Age" type="number" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("age")}

      <Input name="height" placeholder="Height (cm)" type="number" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("height")}

      <Input name="weight" placeholder="Weight (kg)" type="number" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("weight")}

      <Input name="emergency_contact_name" placeholder="Emergency Contact Name" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("emergency_contact_name")}

      <Input name="emergency_contact_number" placeholder="Emergency Contact Number" type="number" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("emergency_contact_number")}

      <Input name="emergency_contact_address" placeholder="Emergency Contact Address" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("emergency_contact_address")}

      <Select
        value={formData.caregiver?.id?.toString() || ""}
        onValueChange={(val) => {
          setFormData((prev) => ({
            ...prev,
            caregiver: { id: parseInt(val, 10) },
          }));
        }}
      >
        <SelectTrigger className="w-full mb-1">
          <SelectValue placeholder="Select Caregiver" />
        </SelectTrigger>
        <SelectContent>
          {caregivers.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.first_name} {c.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div>
      <NavBar />
      <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
        <Card className="w-full max-w-md p-4">
          <CardContent>
            <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>

            <form onSubmit={handleSubmit}>
              {commonFields}
              {patientFields}
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link href="/" className="text-blue-600 underline">
                Login here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>
            <VisuallyHidden>Registration Successful</VisuallyHidden>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-2 text-lg font-semibold">
              Your generated username is: <span className="text-blue-600">{generatedUsername}</span>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
