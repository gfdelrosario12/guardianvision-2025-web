"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function RegistrationForm() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

  const [role, setRole] = useState("admin");
  const [formData, setFormData] = useState<Record<string, any>>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    gender: "",
    mobile_number: "",
    age: "",
    height: "",
    weight: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_contact_address: "",
    caregiver: { id: 0 },
    imageFile: null,
    imagePreview: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [caregivers, setCaregivers] = useState<{ id: number; first_name: string; last_name: string }[]>([]);
  const [caregiversLoading, setCaregiversLoading] = useState(false);
  const router = useRouter();

  // Track online status for NavBar
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (role === "patient") {
      setCaregiversLoading(true);
      fetch(`${API_BASE}/api/caregivers`)
        .then((res) => res.json())
        .then((data) => {
          setCaregivers(data);
          setFormData((prev) => ({ ...prev, caregiver: { id: 0 } }));
        })
        .catch((err) => console.error("Failed to fetch caregivers:", err))
        .finally(() => setCaregiversLoading(false));
    } else {
      setFormData((prev) => ({ ...prev, caregiver: { id: 0 } }));
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouchedFields((prev) => ({ ...prev, confirmPassword: true }));
    if (formData.confirmPassword !== formData.password) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!/^\d+$/.test(formData.mobile_number)) newErrors.mobile_number = "Valid mobile number is required";

    if (role === "patient") {
      if (!formData.age || Number(formData.age) <= 0) newErrors.age = "Valid age is required";
      if (!formData.height || Number(formData.height) <= 0) newErrors.height = "Valid height is required";
      if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = "Valid weight is required";
      if (!formData.emergency_contact_name) newErrors.emergency_contact_name = "Emergency contact name is required";
      if (!/^\d+$/.test(formData.emergency_contact_number)) newErrors.emergency_contact_number = "Valid emergency contact number is required";
      if (!formData.emergency_contact_address) newErrors.emergency_contact_address = "Emergency contact address is required";
      if (!formData.caregiver?.id || formData.caregiver.id === 0) newErrors.caregiver = "Caregiver is required";
      if (!formData.imageFile || !(formData.imageFile instanceof File)) {
        newErrors.imageFile = "Profile picture is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const endpointMap: Record<string, string> = {
      admin: "/api/admins",
      caregiver: "/api/caregivers",
      patient: "/api/patients",
    };

    try {
      setLoading(true);
      let imageUrl = "";

      if (role === "patient" && formData.imageFile instanceof File) {
        const presignRes = await fetch(`${API_BASE}/api/s3/presign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: formData.imageFile.name,
            fileType: formData.imageFile.type,
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to get presigned URL");

        const { url, key } = await presignRes.json();

        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": formData.imageFile.type },
          body: formData.imageFile,
        });

        if (!uploadRes.ok) throw new Error("Image upload to S3 failed");

        imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.ap-southeast-1.amazonaws.com/${key}`;
      }

      // Create a shallow copy of formData to remove non-backend fields
      const dataToSend: Record<string, any> = {
        ...formData,
        imageUrl: imageUrl || undefined,
      };

      delete dataToSend.imageFile;
      delete dataToSend.imagePreview;

      const response = await fetch(`${API_BASE}${endpointMap[role]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const text = await response.text();
      if (!response.ok) throw new Error("Registration failed");

      const result = JSON.parse(text);
      setGeneratedUsername(result.username);
      setShowDialog(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please check the server or form data.");
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field: string) =>
    touchedFields[field] && errors[field] ? (
      <p className="text-red-500 text-sm mb-1">{errors[field]}</p>
    ) : null;

  const commonFields = (
    <>
      <Input name="email" placeholder="Email" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("email")}
      <Input name="password" placeholder="Password" type="password" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("password")}
      <Input
        name="confirmPassword"
        placeholder="Confirm Password"
        type="password"
        onChange={handleChange}
        onBlur={handleConfirmPasswordBlur}
        className="mb-1"
      />
      {renderError("confirmPassword")}

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
          setFormData((prev) => ({ ...prev, gender: val }));
          setTouchedFields((prev) => ({ ...prev, gender: true }));
          setErrors((prev) => ({ ...prev, gender: "" }));
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

      <Input name="mobile_number" placeholder="Mobile Number" type="text" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
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
      <Input name="emergency_contact_number" placeholder="Emergency Contact Number" type="text" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("emergency_contact_number")}
      <Input name="emergency_contact_address" placeholder="Emergency Contact Address" onChange={handleChange} onBlur={handleBlur} className="mb-1" />
      {renderError("emergency_contact_address")}

      <Select
        value={formData.caregiver?.id ? formData.caregiver.id.toString() : ""}
        onValueChange={(val) => {
          setFormData((prev) => ({ ...prev, caregiver: { id: parseInt(val, 10) } }));
          setTouchedFields((prev) => ({ ...prev, caregiver: true }));
        }}
      >
        <SelectTrigger className="w-full mb-1">
          <SelectValue placeholder="Select Caregiver" />
        </SelectTrigger>
        <SelectContent>
          {caregiversLoading ? (
            <SelectItem disabled value="loading">Loading caregivers...</SelectItem>
          ) : caregivers.length > 0 ? (
            caregivers.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                Caregiver #{c.id}: {c.first_name} {c.last_name}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value="none">No caregivers found</SelectItem>
          )}
        </SelectContent>
      </Select>
      {renderError("caregiver")}

      <div className="mb-2">
        <label className="block mb-1 font-medium">Profile Picture (For Patients) *</label>
        <Input
          type="file"
          accept="image/*"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFormData((prev) => ({
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file),
              }));
              setErrors((prev) => ({ ...prev, imageFile: "" }));
              setTouchedFields((prev) => ({ ...prev, imageFile: true }));
            }
          }}
        />
        {touchedFields.imageFile && !formData.imageFile && (
          <p className="text-red-500 text-sm mb-1">Profile picture is required.</p>
        )}
        {formData.imagePreview && (
          <img src={formData.imagePreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full" />
        )}
      </div>
    </>
  );

  return (
    <div>
      <NavBar isOnline={isOnline} />

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

            <div className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link href="/" className="text-blue-600 underline">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>Registration Successful</DialogTitle>
          <DialogDescription>
            Your generated username is:{" "}
            <span className="text-blue-600 font-semibold">{generatedUsername}</span>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
