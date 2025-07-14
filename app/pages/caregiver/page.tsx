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
import { MapPin } from "lucide-react";

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

interface Caregiver {
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
}

function extractCoordinates(location: string): [number, number] | null {
  try {
    const url = new URL(location);
    const query = url.searchParams.get("q");
    if (query) {
      const [latStr, lngStr] = query.split(",");
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
  } catch {
    const match = location.match(/([-+]?[0-9]*\.?[0-9]+),\s*([-+]?[0-9]*\.?[0-9]+)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
  }
  return null;
}

export default function CaregiverPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
  const [isOnline, setIsOnline] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [outages, setOutages] = useState<OutageData[]>([]);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);
  const [rawLocation, setRawLocation] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = document.cookie
        .split("; ")
        .find((row) => row.startsWith("username="))
        ?.split("=")[1];
      setIsOnline(!!username);
    }
  }, []);

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/caregivers/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch caregiver data");
        const data = await res.json();
        setCaregiver(data);
        setPatients(data.patients || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCaregiverData();
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;

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

        const alertsData: AlertData[] = await alertsRes.json();
        const outagesData: OutageData[] = await outagesRes.json();

        const sortedAlerts = alertsData.sort(
          (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
        );
        const sortedOutages = outagesData.sort(
          (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
        );

        setAlerts(sortedAlerts);
        setOutages(sortedOutages);

        const latestLocation =
          sortedAlerts[0]?.lastKnownLocation || sortedOutages[0]?.lastKnownLocation || "";

        setRawLocation(latestLocation);

        const coords = extractCoordinates(latestLocation);
        setMapCoords(coords);
      } catch (err) {
        console.error("Failed to fetch alerts/outages:", err);
      }
    };

    fetchData();
  }, [selectedPatient]);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar isOnline={isOnline} />
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold mb-1 text-black">Welcome Guardian!</h1>
        <p className="mb-4 text-black">Your Patients:</p>
      </div>

      {/* Carousel */}
      <div className="px-6 mb-4">
        <Carousel opts={{ align: "start" }} className="w-full max-w-6xl mx-auto">
          <CarouselContent>
            {patients.map((patient) => (
              <CarouselItem key={patient.id} className="basis-auto md:basis-1/4 lg:basis-1/6">
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6 h-[calc(100vh-280px)]">
        {/* Left Column */}
        <div className="flex flex-col h-full space-y-4 min-h-0">
          <Card className="h-1/2 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              <h2 className="text-base font-semibold text-center mb-2">Patient Info</h2>
              {selectedPatient && (
                <>
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
                    { label: "Emergency Contact", value: `${selectedPatient.emergency_contact_name} (${selectedPatient.emergency_contact_number})` },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <Label>{item.label}</Label>
                      <Input type="text" value={item.value} disabled />
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* Outages */}
          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              <h2 className="text-base font-semibold mb-2 text-center">Recorded Outages</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border-b p-2 text-center">Date & Time</th>
                    <th className="border-b p-2 text-center">Video</th>
                    <th className="border-b p-2 text-center">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {outages.map((outage) => (
                    <tr key={outage.id}>
                      <td className="p-2 text-center">{new Date(outage.timestamp).toLocaleString()}</td>
                      <td className="p-2 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="hover:underline text-blue-600">📹 Watch</button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Outage Video</DialogTitle>
                              <DialogDescription>Footage from event</DialogDescription>
                            </DialogHeader>
                            <video controls className="w-full rounded">
                              <source src={outage.videoUrl} type="video/mp4" />
                            </video>
                          </DialogContent>
                        </Dialog>
                      </td>
                      <td className="p-2 text-center">{outage.lastKnownLocation}</td>
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
              <h2 className="text-base font-semibold mb-2 text-center">Alert Records</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border-b p-2 text-center">Timestamp</th>
                    <th className="border-b p-2 text-center">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="p-2 text-center">{new Date(alert.timestamp).toLocaleString()}</td>
                      <td className="p-2 text-center">{alert.lastKnownLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Google Maps Embed */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="p-3 text-center font-semibold">Last Known Location</div>
              {mapCoords ? (
                <iframe
                  src={`https://www.google.com/maps?q=${mapCoords[0]},${mapCoords[1]}&output=embed`}
                  className="w-full h-full border-0 rounded"
                  allowFullScreen
                  loading="lazy"
                />
              ) : rawLocation ? (
                <div className="h-full flex items-center justify-center text-center text-gray-500 p-4">
                  <div>
                    <MapPin className="h-6 w-6 mx-auto mb-2" />
                    Unable to parse location:
                    <br />
                    <span className="text-xs break-all">{rawLocation}</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-400 p-4">
                  <div>
                    <MapPin className="h-6 w-6 mx-auto mb-2" />
                    No location data available.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
