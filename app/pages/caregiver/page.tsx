"use client";

import { useState } from "react";
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

// Dummy data
const patients = Array.from({ length: 18 }).map((_, index) => ({
  id: index + 1,
  firstName: `Patient${index + 1}`,
  lastName: `Lastname${index + 1}`,
  imageUrl: `https://randomuser.me/api/portraits/${index % 2 === 0 ? "women" : "men"}/${index + 10}.jpg`,
}));

export default function CaregiverPage() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      {/* Welcome Section */}
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold mb-1">Welcome Guardian - NAME!</h1>
        <p className="mb-4">Your Patients:</p>
      </div>

      {/* Carousel */}
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
                  className={`cursor-pointer ${
                    selectedPatient.id === patient.id
                      ? "border-blue-500 border-2"
                      : ""
                  }`}
                >
                  <CardContent className="flex items-center gap-4 px-3">
                    <img
                      src={patient.imageUrl}
                      alt={`${patient.firstName} ${patient.lastName}`}
                      className="w-14 h-14 rounded-full object-cover"
                    />
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6 h-[calc(100vh-280px)]">
        {/* Left Column */}
        <div className="flex flex-col h-full space-y-4 min-h-0">
          {/* Patient Info (Adjusted Height) */}
          <Card className="h-1/2 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-center">Patient Info</h2>
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input type="text" value="72" disabled />
                </div>
                <div className="space-y-1">
                  <Label>Address</Label>
                  <Input type="text" value="123 Mabuhay St., QC, PH" disabled />
                </div>
                <div className="space-y-1">
                  <Label>Medical Condition</Label>
                  <Input type="text" value="Dementia" disabled />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Input type="text" value="Monitored" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recorded Outages */}
          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-4 h-full max-h-full overflow-y-auto">
              <h2 className="text-base font-semibold mb-2 text-center">Recorded Outages</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border-b p-2 text-center">Date & Time</th>
                    <th className="border-b p-2 text-center">Duration & Video</th>
                    <th className="border-b p-2 text-center">Last Location</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-2 text-center">2025-06-0{i + 8} 03:0{i + 2} AM</td>
                      <td className="p-2 text-center text-blue-500">
                        <a href="#" className="inline-flex items-center gap-1 hover:underline">
                          📹 {1 + i}h outage
                        </a>
                      </td>
                      <td className="p-2 text-center">Zone {3 + i}, Taguig City</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full space-y-4 min-h-0">
          {/* Patient Alerts (Adjusted Height) */}
          <Card className="h-1/2 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              <h2 className="text-base font-semibold mb-2 text-center">Patient Alert Records</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border-b p-2 text-center">Date & Time</th>
                    <th className="border-b p-2 text-center">Video</th>
                    <th className="border-b p-2 text-center">Last Location</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-2 text-center">2025-06-1{i} 10:1{i} AM</td>
                      <td className="p-2 text-center text-blue-500">
                        <a href="#" className="inline-flex items-center gap-1 hover:underline">
                          📹 Watch
                        </a>
                      </td>
                      <td className="p-2 text-center">Blk {10 + i}, Mabuhay St., QC</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Map */}
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
