// app/CardGroup.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function PatientCard() {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-center">Patient Info</h2>
      <div className="space-y-1">
        <Label>Full Name</Label>
        <Input type="text" value="Juan Dela Cruz" disabled />
      </div>
      <div className="space-y-1">
        <Label>Age</Label>
        <Input type="text" value="76" disabled />
      </div>
      <div className="space-y-1">
        <Label>Address</Label>
        <Input type="text" value="123 Mabuhay St., QC, PH" disabled />
      </div>
      <div className="space-y-1">
        <Label>Medical Condition</Label>
        <Input type="text" value="Hypertension" disabled />
      </div>
      <div className="space-y-1">
        <Label>Status</Label>
        <Input type="text" value="Monitored" disabled />
      </div>
    </div>
  );
}

export function CaregiverCard() {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-center">Caregiver Info</h2>
      <div className="space-y-1">
        <Label>Full Name</Label>
        <Input type="text" value="Maria Santos" disabled />
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <Input type="text" value="+63 912 345 6789" disabled />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="text" value="maria.santos@guardian.com" disabled />
      </div>
      <div className="space-y-1">
        <Label>Status</Label>
        <Input type="text" value="On Duty" disabled />
      </div>
      <div className="space-y-1">
        <Label>Assigned Patient</Label>
        <Input type="text" value="Juan Dela Cruz" disabled />
      </div>
    </div>
  );
}

export function InformationMessageCard() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="space-y-2 text-sm text-center">
        <p>Your caregiver is successfully tracking you through video and GPS!</p>
        <p>
          <strong>For relatives:</strong> Say “Hey Guardian” for help!
        </p>
        <p>For technical assistance, please click the button to the right.</p>
      </div>
    </div>
  );
}

