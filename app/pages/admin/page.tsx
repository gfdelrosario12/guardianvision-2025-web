"use client";

import { useState } from "react";
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

const adminData = [
  { id: 1, name: "Alice Smith", role: "Super Admin", email: "alice@example.com", firstName: "Alice", lastName: "Smith" },
  { id: 2, name: "Bob Johnson", role: "Moderator", email: "bob@example.com", firstName: "Bob", lastName: "Johnson" },
  { id: 3, name: "Claire Young", role: "Editor", email: "claire@example.com", firstName: "Claire", lastName: "Young" },
  { id: 4, name: "David Lee", role: "Support", email: "david@example.com", firstName: "David", lastName: "Lee" },
  { id: 5, name: "Eva Grey", role: "Admin", email: "eva@example.com", firstName: "Eva", lastName: "Grey" },
];

export default function AdminPage() {
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const selected = adminData.find((admin) => admin.id === selectedAdmin);

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

  const handleEditClick = (admin: typeof adminData[0]) => {
    setSelectedAdmin(admin.id);
    setIsEditingDetails(true);
    setEditableDetails({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    });
  };

  const handleConfirmChanges = () => {
    alert("User info updated (not yet saved to DB)");
    setIsEditingDetails(false);
  };

  const handleCancelEdit = () => {
    setIsEditingDetails(false);
    if (selected) {
      setEditableDetails({
        firstName: selected.firstName,
        lastName: selected.lastName,
        email: selected.email,
        role: selected.role,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />

      <div className="flex flex-col flex-grow bg-gray-100 px-4 pt-4 pb-4 overflow-hidden">
        <h1 className="text-3xl font-bold text-center mb-4">Welcome Administrator - NAME!</h1>

        <div className="flex flex-col flex-grow overflow-hidden gap-4">
          {/* User Database */}
          <div className="flex-grow min-h-0">
            <Card className="h-full">
              <CardContent className="p-4 h-full overflow-y-auto max-h-[calc(100vh-300px)]">
                <h2 className="text-xl font-semibold mb-4">User Database</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-1/3">Name</TableHead>
                      <TableHead className="text-center w-1/3">Role</TableHead>
                      <TableHead className="text-center w-1/3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminData.map((admin) => (
                      <TableRow
                        key={admin.id}
                        className={selectedAdmin === admin.id ? "bg-blue-100 cursor-pointer" : "cursor-pointer"}
                        onClick={() => {
                          setSelectedAdmin(admin.id);
                          setIsEditingDetails(false);
                          setEditableDetails({
                            firstName: admin.firstName,
                            lastName: admin.lastName,
                            email: admin.email,
                            role: admin.role,
                          });
                        }}
                      >
                        <TableCell className="text-center">{admin.name}</TableCell>
                        <TableCell className="text-center">{admin.role}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(admin);
                              }}
                            >
                              Update Info
                            </Button>
                            <Button variant="destructive">Remove</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[45%]">
            {/* User Info Card */}
            <Card className="h-full overflow-hidden">
              <CardContent className="p-4 overflow-y-auto space-y-3 max-h-[calc(100vh-300px)]">
                <h2 className="text-lg font-semibold text-center">User Information</h2>
                {selected ? (
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
                      <Input
                        value={editableDetails.role}
                        disabled={!isEditingDetails}
                        onChange={(e) =>
                          setEditableDetails({ ...editableDetails, role: e.target.value })
                        }
                      />
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

            {/* Change Password Card */}
            <Card className="h-full">
              <CardContent className="p-4 h-full overflow-y-auto space-y-3 max-h-[calc(100vh-300px)]">
                <h2 className="text-lg font-semibold text-center">Change Password</h2>
                <div className="space-y-1">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordFields.newPassword}
                    disabled={!selected}
                    onChange={(e) =>
                      setPasswordFields({
                        ...passwordFields,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordFields.confirmPassword}
                    disabled={!selected}
                    onChange={(e) =>
                      setPasswordFields({
                        ...passwordFields,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                {selected && (
                  <div className="pt-3">
                    <Button onClick={() => alert("Password updated!")}>Update Password</Button>
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
