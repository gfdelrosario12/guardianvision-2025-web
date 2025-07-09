"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import router from "next/router";

interface Patient {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  address: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  mobileNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactAddress: string;
  imageUrl?: string;
  caregiverId?: number;
}

interface Caregiver {
  id: number;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
    address: string;
  gender: string;
  role: string;
}

interface AlertData {
  id: number;
  videoUrl: string;
  lastKnownLocation: string;
  timestamp: string;
}

interface OutageData {
  id: number;
  videoUrl: string;
  lastKnownLocation: string;
  timestamp: string;
}

export default function PatientPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
  const [isOnline, setIsOnline] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [outages, setOutages] = useState<OutageData[]>([]);

  const getCookie = (key: string) => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
  };

    useEffect(() => {
    const username = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];
    if (!username) {
      setIsOnline(false);
      router.push("/");
    } else {
      setIsOnline(true);
    }
  }, []);

  useEffect(() => {
    const jwt = getCookie("jwt");
    if (jwt) setIsOnline(true);

    const fetchData = async () => {
      try {
        const userId = getCookie("userId");
        if (!userId) return;

        const patientRes = await fetch(`${API_BASE}/api/patients/${userId}`, {
          credentials: "include",
        });
        const patientData = await patientRes.json();
        setPatient({
          ...patientData,
          mobileNumber: patientData.mobileNumber ?? "",
          emergencyContactName: patientData.emergencyContactName ?? "",
          emergencyContactNumber: patientData.emergencyContactNumber ?? "",
          emergencyContactAddress: patientData.emergencyContactAddress ?? "",
        });

        const caregiverId = patientData?.caregiverId;
        if (caregiverId !== undefined && caregiverId !== null) {
          const caregiverRes = await fetch(
            `${API_BASE}/api/caregivers/${caregiverId}`,
            { credentials: "include" }
          );
          const caregiverData = await caregiverRes.json();
          setCaregiver({
            ...caregiverData,
            mobileNumber: caregiverData.mobileNumber ?? "",
          });
        }

        const [alertsRes, outagesRes] = await Promise.all([
          fetch(`${API_BASE}/api/alerts/patient/${userId}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/outages/patient/${userId}`, {
            credentials: "include",
          }),
        ]);

        const alertsJson = await alertsRes.json();
        const outagesJson = await outagesRes.json();

        setAlerts(
          alertsJson.map((a: any) => ({
            id: a.id,
            videoUrl: a.video_url,
            timestamp: a.timestamp,
            lastKnownLocation: a.last_known_location,
          }))
        );

        setOutages(
          outagesJson.map((o: any) => ({
            id: o.id,
            videoUrl: o.video_url,
            timestamp: o.timestamp,
            lastKnownLocation: o.last_known_location,
          }))
        );
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);
  const safeValue = (value: any) => value ?? "";

  return (
    <div className="h-screen flex flex-col">
      <NavBar isOnline={isOnline} />
      <div className="flex-1 bg-gray-100 p-6 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-black">
          Welcome Patient - {patient ? `${patient.firstName} ${patient.lastName}` : "Loading..."}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
          <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
            <Card className="h-full max-h-[50%] overflow-auto">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-base font-semibold text-center mb-2">Patient Information</h2>
                {patient?.imageUrl && (
                  <img
                    src={patient.imageUrl}
                    alt="Patient"
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                )}
                {[{ label: "Full Name", value: `${patient?.firstName} ${patient?.middleName || ""} ${patient?.lastName}` },
                { label: "Username", value: safeValue(patient?.username) },
                { label: "Email", value: safeValue(patient?.email) },
                { label: "Gender", value: safeValue(patient?.gender) },
                { label: "Age", value: safeValue(patient?.age) },
                { label: "Height (cm)", value: safeValue(patient?.height) },
                { label: "Weight (kg)", value: safeValue(patient?.weight) },
                { label: "Mobile Number", value: safeValue(patient?.mobileNumber) },
                { label: "Address", value: safeValue(patient?.address) },
                { label: "Emergency Contact Name", value: safeValue(patient?.emergencyContactName) },
                { label: "Emergency Contact Number", value: safeValue(patient?.emergencyContactNumber) },
                { label: "Emergency Contact Address", value: safeValue(patient?.emergencyContactAddress) },

                ].map((item, i) => (
                  <div key={i}>
                    <Label>{item.label}</Label>
                    <Input value={item.value} disabled />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full max-h-[50%] overflow-auto">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-base font-semibold text-center mb-2">Assigned Caregiver</h2>
                {[{ label: "Full Name", value: caregiver ? `${caregiver.firstName} ${caregiver.middleName || ""} ${caregiver.lastName}` : "Not assigned yet" },
                { label: "Username", value: safeValue(caregiver?.username) },
                { label: "Email", value: safeValue(caregiver?.email) },
                { label: "Mobile Number", value: safeValue(caregiver?.mobileNumber) },
                { label: "Gender", value: safeValue(caregiver?.gender) },
                { label: "Address", value: safeValue(caregiver?.address) },
                { label: "Role", value: safeValue(caregiver?.role) },
                ].map((item, i) => (
                  <div key={i}>
                    <Label>{item.label}</Label>
                    <Input value={item.value} disabled />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-full max-h-[50%] overflow-auto">
              <CardContent className="p-4 space-y-2">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="space-y-2 text-sm text-center">
                    <p>Your caregiver is successfully tracking you through video and GPS!</p>
                    <p>
                      <strong>For relatives:</strong> Say “Hey Guardian” for help!
                    </p>
                    <p>For technical assistance, please click the button to the right.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-center">Patient Alert Records</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-center">Date & Time</th>
                      <th className="border-b p-2 text-center">Last Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className="p-2 text-center">{new Date(alert.timestamp).toLocaleString()}</td>
                        <td className="p-2 text-center">{decodeURIComponent(alert.lastKnownLocation || "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-center">Recorded Outages</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-center">Date & Time</th>
                      <th className="border-b p-2 text-center">Video</th>
                      <th className="border-b p-2 text-center">Last Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outages.map((outage) => (
                      <tr key={outage.id}>
                        <td className="p-2 text-center">{new Date(outage.timestamp).toLocaleString()}</td>
                        <td className="p-2 text-center text-blue-500">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="hover:underline inline-flex gap-1 items-center">📹 Watch</button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Outage Video</DialogTitle>
                                <DialogDescription>Review the recorded outage.</DialogDescription>
                              </DialogHeader>
                              <video controls className="w-full rounded">
                                <source src={outage.videoUrl} type="video/mp4" />
                              </video>
                            </DialogContent>
                          </Dialog>
                        </td>
                        <td className="p-2 text-center">{decodeURIComponent(outage.lastKnownLocation || "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {[
                {
                  label: "🚪 Opt-Out of Guardian Vision",
                  title: "Opt-Out Confirmation",
                  desc: "Are you sure you want to opt out of Guardian Vision?",
                },
                {
                  label: "🧑‍⚕️ Contact My Guardian/Caregiver",
                  title: "Contact Guardian",
                  desc: "Your guardian will be notified.",
                },
                {
                  label: "🛠️ Tech Help",
                  title: "Technical Support",
                  desc: "Please describe the issue.",
                },
                {
                  label: "🎙️ Hey Guardian Voice Sample",
                  title: "Voice Sample Playback",
                  desc: "This is what you say to activate Guardian Vision.",
                  video: "/media/hey-guardian-sample.mp4", // ensure this path is correct
                },
                {
                  label: "📧 Email Guardian Vision",
                  title: "Email Support",
                  desc: "We’ll help you compose a message.",
                },
                {
                  label: "📞 Call Guardian Vision",
                  title: "Call Support",
                  desc: "Connecting to a support agent.",
                },
              ].map(({ label, title, desc, video }, i) => (
                <Dialog key={i}>
                  <DialogTrigger asChild>
                    <Button className="w-full py-1.5 flex items-center justify-center gap-2 text-sm">
                      {label}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{title}</DialogTitle>
                      <DialogDescription>{desc}</DialogDescription>
                    </DialogHeader>
                    {video && (
                      <div className="mt-4">
                        <video
                          controls
                          src={video}
                          className="w-full rounded shadow"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}