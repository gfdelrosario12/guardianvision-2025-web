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
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
};

type Caregiver = {
  id: number;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
  patients: Patient[];
};

type Patient = {
  id: number;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
  caregiver: Caregiver;
};

type User = Admin | Caregiver | Patient;

export default function AdminPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editableDetails, setEditableDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });
  const [passwordFields, setPasswordFields] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch all users from backend
  useEffect(() => {
    fetch("http://localhost:8080/api/admins/users", {
      credentials: "include",
    })
      .then((res: Response) => res.json())
      .then((data: { admins: Admin[]; caregivers: Caregiver[]; patients: Patient[] }) => {
        const merged: User[] = [
          ...data.admins.map((a) => ({ ...a, role: "admin" })),
          ...data.caregivers.map((c) => ({ ...c, role: "caregiver" })),
          ...data.patients.map((p) => ({ ...p, role: "patient" })),
        ];
        setAllUsers(merged);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch users:", err);
      });
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditingDetails(true);
    setEditableDetails({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  };

  const handleCancelEdit = () => {
    setIsEditingDetails(false);
    if (selectedUser) {
      setEditableDetails({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        role: selectedUser.role,
      });
    }
  };

  const handleConfirmChanges = () => {
    if (!selectedUser) return;

    fetch(`http://localhost:8080/api/admins/users/${selectedUser.role}/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(editableDetails),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then(() => {
        alert("User info updated");
        setIsEditingDetails(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Update failed");
      });
  };

  const handlePasswordUpdate = () => {
    if (!selectedUser || passwordFields.newPassword !== passwordFields.confirmPassword) {
      alert("Password mismatch");
      return;
    }

    fetch(`http://localhost:8080/api/admins/users/${selectedUser.role}/${selectedUser.id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ newPassword: passwordFields.newPassword }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Password update failed");
        alert("Password updated");
        setPasswordFields({ newPassword: "", confirmPassword: "" });
      })
      .catch((err) => {
        console.error(err);
        alert("Password update failed");
      });
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
                          setEditableDetails({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                          });
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
                            <Button variant="destructive" onClick={() => alert("Delete not implemented")}>
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

          {/* Info and Password Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[45%]">
            {/* Info */}
            <Card className="h-full overflow-hidden">
              <CardContent className="p-4 overflow-y-auto space-y-3 max-h-[calc(100vh-300px)]">
                <h2 className="text-lg font-semibold text-center">User Information</h2>
                {selectedUser ? (
                  <>
                    <div className="space-y-1">
                      <Label>First Name</Label>
                      <Input
                        value={editableDetails.firstName}
                        disabled={!isEditingDetails}
                        onChange={(e) =>
                          setEditableDetails({ ...editableDetails, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Last Name</Label>
                      <Input
                        value={editableDetails.lastName}
                        disabled={!isEditingDetails}
                        onChange={(e) =>
                          setEditableDetails({ ...editableDetails, lastName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        value={editableDetails.email}
                        disabled={!isEditingDetails}
                        onChange={(e) =>
                          setEditableDetails({ ...editableDetails, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Role</Label>
                      <Input value={editableDetails.role} disabled />
                    </div>
                    {isEditingDetails && (
                      <div className="flex justify-end gap-2 pt-3">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={handleConfirmChanges}>Save</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-gray-500">Select a user to view info</p>
                )}
              </CardContent>
            </Card>

            {/* Password */}
            <Card className="h-full">
              <CardContent className="p-4 h-full overflow-y-auto space-y-3 max-h-[calc(100vh-300px)]">
                <h2 className="text-lg font-semibold text-center">Change Password</h2>
                <div className="space-y-1">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordFields.newPassword}
                    disabled={!selectedUser}
                    onChange={(e) =>
                      setPasswordFields({ ...passwordFields, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordFields.confirmPassword}
                    disabled={!selectedUser}
                    onChange={(e) =>
                      setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })
                    }
                  />
                </div>
                {selectedUser && (
                  <div className="pt-3">
                    <Button onClick={handlePasswordUpdate}>Update Password</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
