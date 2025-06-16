"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";

export default function RegistrationForm() {
  const [role, setRole] = useState("admin");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value || !/\S+@\S+\.\S+/.test(value))
          error = "Valid email is required";
        break;
      case "password":
        if (!value || value.length < 6)
          error = "Password must be at least 6 characters";
        break;
      case "first_name":
        if (!value) error = "First name is required";
        break;
      case "last_name":
        if (!value) error = "Last name is required";
        break;
      case "middle_name":
        break;
      case "address":
        if (!value) error = "Address is required";
        break;
      case "gender":
        if (!value || value === "") error = "Gender is required";
        break;
      case "mobile_number":
        if (!/^\d+$/.test(value)) error = "Valid mobile number is required";
        break;
      case "employee_id":
        if (role === "caregiver" && !value) error = "Employee ID is required";
        break;
      case "age":
        if (role === "patient" && (!value || !/^\d+$/.test(value)))
          error = "Valid age is required";
        break;
      case "height":
        if (role === "patient" && (!value || isNaN(Number(value)) || Number(value) <= 0))
          error = "Valid height is required";
        break;
      case "weight":
        if (role === "patient" && (!value || isNaN(Number(value)) || Number(value) <= 0))
          error = "Valid weight is required";
        break;
      case "emergency_contact_name":
        if (role === "patient" && !value)
          error = "Emergency contact name is required";
        break;
      case "emergency_contact_number":
        if (role === "patient" && (!value || !/^\d+$/.test(value)))
          error = "Valid emergency number is required";
        break;
      case "emergency_contact_address":
        if (role === "patient" && !value)
          error = "Emergency address is required";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    Object.entries(formData).forEach(([name, value]) =>
      validateField(name, value)
    );
    return Object.values(errors).every((err) => err === "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", { role, ...formData });
      // router.push("/success");
    }
  };

  const renderError = (field: string) =>
    errors[field] && (
      <p className="text-red-500 text-sm mb-2">{errors[field]}</p>
    );

  const commonFields = (
    <>
      <Input
        placeholder="Email"
        name="email"
        onChange={handleChange}
        onBlur={handleBlur}
        className="mb-1"
      />
      {renderError("email")}

      <Input
        placeholder="Password"
        name="password"
        type="password"
        onChange={handleChange}
        onBlur={handleBlur}
        className="mb-1"
      />
      {renderError("password")}

      <div className="flex gap-2 mb-1">
        <Input
          placeholder="First Name"
          name="first_name"
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-1/3"
        />
        <Input
          placeholder="Middle Name"
          name="middle_name"
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-1/3"
        />
        <Input
          placeholder="Last Name"
          name="last_name"
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-1/3"
        />
      </div>
      {renderError("first_name")}
      {renderError("middle_name")}
      {renderError("last_name")}

      <Input
        placeholder="Address"
        name="address"
        onChange={handleChange}
        onBlur={handleBlur}
        className="mb-1"
      />
      {renderError("address")}

      <Select
        value={formData.gender || ""}
        onValueChange={(value) => {
          setFormData({ ...formData, gender: value });
          setErrors({ ...errors, gender: "" });
        }}
      >
        <SelectTrigger
          className="w-full mb-1"
          onBlur={() =>
            validateField("gender", formData.gender || "")
          }
        >
          <SelectValue placeholder="Select Sex" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Male">Male</SelectItem>
          <SelectItem value="Female">Female</SelectItem>
        </SelectContent>
      </Select>
      {renderError("gender")}

      <Input
        placeholder="Mobile Number"
        name="mobile_number"
        type="number"
        onChange={handleChange}
        onBlur={handleBlur}
        className="mb-1"
      />
      {renderError("mobile_number")}
    </>
  );

  const additionalFields = () => {
    switch (role) {
      case "patient":
        return (
          <>
            <Input
              placeholder="Age"
              name="age"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
            />
            {renderError("age")}

            <Input
              placeholder="Height (cm)"
              name="height"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
            />
            {renderError("height")}

            <Input
              placeholder="Weight (kg)"
              name="weight"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
            />
            {renderError("weight")}

            <Input
              placeholder="Emergency Contact Name"
              name="emergency_contact_name"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
            />
            {renderError("emergency_contact_name")}

            <Input
              placeholder="Emergency Contact Number"
              name="emergency_contact_number"
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
            />
            {renderError("emergency_contact_number")}

            <Input
              placeholder="Emergency Contact Address"
              name="emergency_contact_address"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
            />
            {renderError("emergency_contact_address")}
          </>
        );
      default:
        return null;
    }
  };

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
              {additionalFields()}
              <Button type="submit" className="w-full mt-4">
                Register
              </Button>
            </form>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <a href="/" className="text-blue-600 underline">
                Login here
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
