"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Patient {
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
  imageUrl?: string;
  caregiver: { id: number } | null;
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

type Caregiver = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  gender: string;
  mobile_number: string;
  role: string;
  patients: Patient[];
};

export default function CaregiverPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

  const [isOnline, setIsOnline] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [outages, setOutages] = useState<OutageData[]>([]);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);

  useEffect(() => {
    const username = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];
    setIsOnline(!!username);
  }, []);

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/caregivers/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch caregiver data: ${res.status} ${text}`);
        }

        const caregiverData = await res.json();
        setCaregiver(caregiverData);
        setPatients(caregiverData.patients || []);
      } catch (error) {
        console.error('Error fetching caregiver data:', error);
      }
    };

    fetchCaregiverData();
  }, []);


  useEffect(() => {
    if (!selectedPatient) return;

    console.log("Selected patient:", selectedPatient); // ✅ Add here

    const fetchData = async () => {
      try {
        const [alertsRes, outagesRes] = await Promise.all([
          fetch(`${API_BASE}/api/alerts/patient/${selectedPatient.id}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/outages/patient/${selectedPatient.id}`, {
            credentials: "include",
          }),
        ]);

        const alertsJson = await alertsRes.json();
        const outagesJson = await outagesRes.json();

        console.log("Fetched alerts:", alertsJson);
        console.log("Fetched outages:", outagesJson);

        const alertsData = alertsJson.map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          videoUrl: item.video_url,
          lastKnownLocation: item.last_known_location,
        }));

        const outagesData = outagesJson.map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          videoUrl: item.video_url,
          lastKnownLocation: item.last_known_location,
        }));

        setAlerts(alertsData);
        setOutages(outagesData);
      } catch (err) {
        console.error("Error fetching alerts or outages:", err);
      }
    };

    fetchData();
  }, [selectedPatient]);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar isOnline={isOnline} />

      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold mb-1 text-black dark:text-black">Welcome Guardian!</h1>
        <p className="mb-4 text-black dark:text-black">Your Patients:</p>
      </div>

      <div className="px-6 mb-4">
        <Carousel opts={{ align: "start" }} className="w-full max-w-6xl mx-auto">
          <CarouselContent>
            {patients.map((patient) => (
              <CarouselItem
                key={patient.id}
                className="basis-auto md:basis-1/4 lg:basis-1/6"
              >
                <Card
                  onClick={() => setSelectedPatient(patient)}
                  className={`cursor-pointer ${selectedPatient?.id === patient.id ? "border-blue-500 border-2" : ""
                    }`}
                >
                  <CardContent className="flex items-center gap-4 px-3">
                    {patient.imageUrl && (
                      <img
                        src={patient.imageUrl}
                        alt={`${patient.firstName} ${patient.lastName}`}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    )}
                    <p className="text-sm font-medium text-left">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6 h-[calc(100vh-280px)]">
        {/* Left Column */}
        <div className="flex flex-col h-full space-y-4 min-h-0">
          <Card className="h-1/2 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-center">Patient Info</h2>
                {selectedPatient && (
                  <>
                    <div>
                      <Label>Profile Picture:</Label>
                      <img
                        src={selectedPatient.imageUrl}
                        alt="Patient"
                        className="w-32 h-32 object-cover rounded-full"
                      />
                    </div>
                    {[
                      { label: "Full Name", value: `${selectedPatient.firstName} ${selectedPatient.middleName || ""} ${selectedPatient.lastName}` },
                      { label: "Username", value: selectedPatient.username },
                      { label: "Email", value: selectedPatient.email },
                      { label: "Gender", value: selectedPatient.gender },
                      { label: "Age", value: selectedPatient.age.toString() },
                      { label: "Height (cm)", value: selectedPatient.height.toString() },
                      { label: "Weight (kg)", value: selectedPatient.weight.toString() },
                      { label: "Mobile Number", value: selectedPatient.mobile_number },
                      { label: "Address", value: selectedPatient.address },
                      { label: "Emergency Contact Name", value: selectedPatient.emergency_contact_name },
                      { label: "Emergency Contact Number", value: selectedPatient.emergency_contact_number },
                      { label: "Emergency Contact Address", value: selectedPatient.emergency_contact_address },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <Label>{item.label}</Label>
                        <Input type="text" value={item.value} disabled />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-4 h-full max-h-full overflow-y-auto">
              <h2 className="text-base font-semibold mb-2 text-center">Recorded Outages</h2>
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
                              <DialogDescription>Review the recorded footage.</DialogDescription>
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
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full space-y-4 min-h-0">
          <Card className="h-1/2 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              <h2 className="text-base font-semibold mb-2 text-center">Patient Alert Records</h2>
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

          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-0 h-full max-h-full overflow-hidden flex flex-col">
              <div className="p-3">
                <h2 className="text-base font-semibold text-center">Patient Last Known Location</h2>
              </div>
              <div className="flex-1">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.018343888717!2d121.0405950153453!3d14.67604148975762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7d75e0b8473%3A0x4d8c9a2338a172ac!2sQuezon%20City%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1718553091641!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="border-0 w-full h-full"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}