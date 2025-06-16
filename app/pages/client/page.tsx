"use client";

import NavBar from "@/components/NavBar/NavBar";
import { CaregiverCard, PatientCard, InformationMessageCard } from "./CardGroup";
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

export default function ClientPage() {
  return (
    <div className="h-screen flex flex-col">
      <NavBar />

      <div className="flex-1 bg-gray-100 p-6 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Welcome Patient - NAME!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-4rem)]">
          {/* Left Column */}
          <div className="space-y-4 overflow-hidden">
            {[PatientCard, CaregiverCard, InformationMessageCard].map((Component, i) => (
              <Card key={i} className="h-64 overflow-hidden">
                <CardContent className="p-4 h-full overflow-y-auto">
                  <Component />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4 overflow-hidden">
            {/* Patient Alert Records */}
            <Card className="h-1/3 overflow-hidden">
              <CardContent className="p-4 h-full overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2 text-center">Patient Alert Records</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-center">Date & Time</th>
                      <th className="border-b p-2 text-center">Video</th>
                      <th className="border-b p-2 text-center">Last Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, i) => (
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

            {/* Recorded Outages */}
            <Card className="h-1/3 overflow-hidden">
              <CardContent className="p-4 h-full overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2 text-center">Recorded Outages</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-center">Date & Time</th>
                      <th className="border-b p-2 text-center">Duration & Video</th>
                      <th className="border-b p-2 text-center">Last Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 2 }).map((_, i) => (
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
