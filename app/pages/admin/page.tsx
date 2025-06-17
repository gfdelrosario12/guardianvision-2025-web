"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

// Types
type Role = "admin" | "caregiver" | "patient";

interface UserSummary {
  id: number;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
}

interface Administrator {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminPage() {
  const [me, setMe] = useState<Administrator | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const selected = users.find(u => u.id === selectedId);
  const [editable, setEditable] = useState({
    firstName: "", lastName: "", email: ""
  });
  const [passwords, setPasswords] = useState({
    newPassword: "", confirmPassword: ""
  });

useEffect(() => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  (async () => {
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/api/admins/me`, { credentials: "include" }),
        fetch(`${baseUrl}/api/admins/users`, { credentials: "include" }),
      ]);
      if (!meRes.ok) throw new Error();
      setMe(await meRes.json());
      if (!usersRes.ok) throw new Error();
      setUsers(await usersRes.json());
    } catch {
      console.error("Admin auth failed");
    }
  })();
}, []);


  const onSelect = (u: UserSummary) => {
    setSelectedId(u.id);
    setSelectedRole(u.role);
    setEditable({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email
    });
    setPasswords({ newPassword: "", confirmPassword: "" });
  };

  const saveInfo = async () => {
    if (!selectedId || !selectedRole) return;
    const res = await fetch(`/api/admins/users/${selectedRole}/${selectedId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editable)
    });
    if (res.ok) {
      setUsers(users.map(u =>
        u.id === selectedId ? { ...u, ...editable } : u
      ));
      alert("Info updated!");
    } else alert("Update failed");
  };

  const savePassword = async () => {
    if (!selectedId || !selectedRole) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("Passwords must match");
    }
    const res = await fetch(`/api/admins/users/${selectedRole}/${selectedId}/password`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: passwords.newPassword })
    });
    res.ok ? alert("Password changed!") : alert("Password update failed");
  };

  const removeUser = async () => {
    if (!selectedId || !selectedRole) return;
    if (!confirm("Remove this user?")) return;
    const res = await fetch(`/api/admins/users/${selectedRole}/${selectedId}`, {
      method: "DELETE", credentials: "include"
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== selectedId));
      setSelectedId(null);
      alert("User removed");
    } else alert("Delete failed");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />

      <div className="flex flex-col flex-grow bg-gray-100 p-4 overflow-hidden">
        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome Administrator – {me ? me.firstName : "Loading..."}!
        </h1>

        {/* User Table */}
        <Card className="flex-grow overflow-hidden mb-4">
          <CardContent className="p-4 overflow-y-auto">
            <h2 className="text-xl mb-3">User Database</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow
                    key={`${u.role}-${u.id}`}
                    className={u.id === selectedId ? "bg-blue-100" : ""}
                  >
                    <TableCell>{u.firstName} {u.lastName}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => onSelect(u)}>Select</Button>
                        <Button variant="destructive" onClick={() => {
                          onSelect(u);
                          removeUser();
                        }}>Remove</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details & Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Info Editor */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-lg">User Information</h2>
              {selected ? (
                <>
                  {["firstName", "lastName", "email"].map((field) => (
                    <div key={field}>
                      <Label className="capitalize">{field}</Label>
                      <Input
                        value={(editable as any)[field]}
                        onChange={e => setEditable({ ...editable, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 justify-end">
                    <Button onClick={saveInfo}>Save</Button>
                  </div>
                </>
              ) : (
                <p>Select a user to view info.</p>
              )}
            </CardContent>
          </Card>

          {/* Password Editor */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-lg">Change Password</h2>
              {selected ? (
                <>
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwords.newPassword}
                      onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Confirm</Label>
                    <Input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={savePassword}>Update Password</Button>
                  </div>
                </>
              ) : (
                <p>Select a user to change password.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
