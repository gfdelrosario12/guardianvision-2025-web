"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Admin = {
  id: number;
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  gender: string;
  mobile_number: string;
  role: string;
};

type Patient = {
  id: number;
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  height: number;
  weight: number;
  address: string;
  gender: string;
  mobile_number: string;
  role: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  emergency_contact_address: string;
  caregiver: Caregiver;
};

type Caregiver = {
  id: number;
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  gender: string;
  mobile_number: string;
  role: string;
  patients: Patient[];
};

type User = Admin | Caregiver | Patient;

export default function AdminPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/admins/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const merged: User[] = [
          ...data.admins.map((a: Admin) => ({ ...a, role: "admin" })),
          ...data.caregivers.map((c: Caregiver) => ({ ...c, role: "caregiver" })),
          ...data.patients.map((p: Patient) => ({ ...p, role: "patient" })),
        ];
        setAllUsers(merged);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditingDetails(true);
  };

  const handleInputChange = (field: string, value: string) => {
    if (!selectedUser) return;
    setSelectedUser({ ...selectedUser, [field]: value });
  };

  const handlePasswordChange = () => {
    alert(`Password changed to: ${newPassword}`);
    setNewPassword("");
  };

  const handleSaveChanges = () => {
    alert("User information saved.");
    setIsEditingDetails(false);
  };

  const renderUserInfo = (user: User) => {
    const isPatient = "emergency_contact_name" in user;
    const isCaregiver = "patients" in user;

    return (
      <div className="space-y-3">
        {["username", "email", "firstName", "middleName", "lastName", "address", "gender", "mobile_number"].map(
          (field) => (
            <div key={field}>
              <Label className="capitalize">{field.replace("_", " ")}:</Label>
              <Input
                value={(user as any)[field] || ""}
                disabled={!isEditingDetails}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            </div>
          )
        )}

        {isPatient && (
          <>
            {["age", "height", "weight", "emergency_contact_name", "emergency_contact_number", "emergency_contact_address"].map(
              (field) => (
                <div key={field}>
                  <Label className="capitalize">{field.replace(/_/g, " ")}:</Label>
                  <Input
                    value={(user as any)[field] || ""}
                    disabled={!isEditingDetails}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                </div>
              )
            )}
            <div>
              <Label>Caregiver:</Label>
              <Input
                value={`${user.caregiver?.firstName || ""} ${user.caregiver?.lastName || ""}`}
                disabled
              />
            </div>
          </>
        )}

        {isCaregiver && (
          <div>
            <Label>Patients:</Label>
            <ul className="list-disc pl-6">
              {user.patients.map((p) => (
                <li key={p.id}>{p.firstName} {p.lastName}</li>
              ))}
            </ul>
          </div>
        )}

        {isEditingDetails && (
          <div className="pt-2">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />

      <div className="flex flex-col flex-grow bg-gray-100 px-4 pt-4 pb-4 overflow-hidden">
        <h1 className="text-3xl font-bold text-center mb-4">Welcome Administrator</h1>

        <div className="flex flex-col flex-grow overflow-hidden gap-4">
          {/* User Table */}
          <div className="flex-grow min-h-0">
            <Card className="h-full">
              <CardContent className="p-4 h-full overflow-y-auto max-h-[calc(100vh-300px)]">
                <h2 className="text-xl font-semibold mb-4">User Database</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Username</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-center">First Name</TableHead>
                      <TableHead className="text-center">Middle Name</TableHead>
                      <TableHead className="text-center">Last Name</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow
                        key={`${user.role}-${user.id}`}
                        className={
                          selectedUser?.id === user.id && selectedUser?.role === user.role
                            ? "bg-blue-100 cursor-pointer"
                            : "cursor-pointer"
                        }
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditingDetails(false);
                        }}
                      >
                        <TableCell className="text-center">{user.username}</TableCell>
                        <TableCell className="text-center">{user.role}</TableCell>
                        <TableCell className="text-center">{user.firstName}</TableCell>
                        <TableCell className="text-center">{user.middleName || "-"}</TableCell>
                        <TableCell className="text-center">{user.lastName}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(user);
                              }}
                            >
                              Update Info
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("Delete not implemented yet");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="h-[45%] grid grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardContent className="p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
                <h2 className="text-lg font-semibold text-center mb-2">User Information</h2>
                {selectedUser ? (
                  renderUserInfo(selectedUser)
                ) : (
                  <p className="text-center text-gray-500">Select a user to view info</p>
                )}
              </CardContent>
            </Card>

            {/* Password Change Panel */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-center mb-2">Change Password</h2>
                <div className="space-y-3">
                  <Label>New Password:</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button onClick={handlePasswordChange}>Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}