"use client";

import * as React from "react";
import { User, Mail, Building, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/auth-context";

export function ProfileView() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = React.useState(user?.name || "Dr. Elena Rostova");
  const [email, setEmail] = React.useState(user?.email || "elena.rostova@earth.org");
  const [role, setRole] = React.useState(user?.role || "Lead Field Ecologist");
  const [organization, setOrganization] = React.useState(user?.organization || "Global Biosphere Survey");
  const [bio, setBio] = React.useState(
    "Field researcher specializing in sub-alpine floral phenology, soil mycorrhizal networks, and arid biome hydrology."
  );

  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setOrganization(user.organization);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        role: role.trim(),
        organization: organization.trim(),
      });
      setIsSaving(false);
      toast.success("Profile Updated", {
        description: "Your researcher credentials have been saved.",
      });
    }, 300);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1 pb-4 border-b border-border/80">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Researcher Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your environmental observatory credentials and field identification.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar & Identicon Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-border/60">
            <Avatar className="h-16 w-16">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
              <AvatarFallback className="bg-earth-terracotta text-white font-medium text-lg">
                {user?.initials || "ER"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-normal text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground">{email} &bull; {role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prof-name" required>Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prof-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prof-email"
                  value={email}
                  disabled
                  className="pl-9 bg-muted/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-role">Field Role / Specialization</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prof-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-org">Organization / Institution</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prof-org"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-bio">Bio &amp; Research Interests</Label>
            <Textarea
              id="prof-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
