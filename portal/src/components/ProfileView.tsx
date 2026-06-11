import React, { useState } from "react";
import { fetchApi, setUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Mail, Phone, MapPin, Shield, CheckCircle2, 
  AlertCircle, Eye, EyeOff, Save, KeyRound, Check, X
} from "lucide-react";

interface ProfileViewProps {
  user: any;
  onProfileUpdate: (updatedUser: any) => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=DrAdit",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
];

export default function ProfileView({ user, onProfileUpdate }: ProfileViewProps) {
  // Personal Info Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [address, setAddress] = useState(user?.address || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [currentPasswordForSensitive, setCurrentPasswordForSensitive] = useState("");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status indicators
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");

  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");

  // Password strength checklist
  const passCriteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: "None", color: "bg-muted" };
    let score = 0;
    if (passCriteria.length) score += 25;
    if (passCriteria.uppercase) score += 25;
    if (passCriteria.lowercase) score += 25;
    if (passCriteria.number) score += 25;

    if (score <= 50) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 75) return { score, label: "Medium", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const isEmailChanged = email.trim().toLowerCase() !== user?.email?.trim().toLowerCase();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess("");
    setInfoLoading(true);

    try {
      const payload: any = {
        name,
        email,
        phoneNumber,
        address,
        avatar,
      };

      if (isEmailChanged) {
        if (!currentPasswordForSensitive) {
          throw new Error("Current password is required to verify ownership before changing your email.");
        }
        payload.currentPassword = currentPasswordForSensitive;
      }

      const res = await fetchApi("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        setUser(res.data);
        onProfileUpdate(res.data);
        setInfoSuccess("Personal information updated successfully.");
        setCurrentPasswordForSensitive(""); // reset password input
      } else {
        throw new Error(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setInfoError(err.message || "An unexpected error occurred.");
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError("");
    setSecuritySuccess("");

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      return;
    }

    if (!passCriteria.length || !passCriteria.uppercase || !passCriteria.lowercase || !passCriteria.number) {
      setSecurityError("Password does not meet the strength requirements.");
      return;
    }

    setSecurityLoading(true);

    try {
      const res = await fetchApi("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.success) {
        setSecuritySuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(res.error || "Failed to change password.");
      }
    } catch (err: any) {
      setSecurityError(err.message || "An unexpected error occurred.");
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl text-left">
      {/* Upper Info Banner */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl bg-card/40 border border-border backdrop-blur-md">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-primary/20 bg-muted">
            <AvatarImage src={avatar || PRESET_AVATARS[0]} />
            <AvatarFallback className="text-xl font-bold uppercase text-primary">
              {name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl font-black text-foreground">{name || "Your Profile"}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-xs font-black uppercase px-2.5 py-0.5 rounded-lg">
              Role: {user?.role}
            </Badge>
            {user?.specialization && (
              <Badge variant="outline" className="bg-indigo-500/5 text-indigo-400 border-indigo-500/10 text-xs font-black uppercase px-2.5 py-0.5 rounded-lg">
                {user.specialization}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground pt-1">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Panel */}
        <Card className="bg-card/40 border-border rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Details
            </CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground mt-0.5">
              Manage your personal credentials and visibility settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {infoSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-semibold">{infoSuccess}</span>
                </div>
              )}
              {infoError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-semibold">{infoError}</span>
                </div>
              )}

              {/* Avatar Preset Grid */}
              <div className="space-y-2.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Select Avatar Preset</Label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition ${
                        avatar === url ? "border-primary ring-2 ring-primary/20 scale-105" : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img src={url} alt={`avatar-${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Avatar URL */}
              <div className="space-y-1.5">
                <Label htmlFor="avatar-url" className="text-xs font-black uppercase text-muted-foreground">Or Avatar Image URL</Label>
                <Input
                  id="avatar-url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="bg-background/50 border-border rounded-xl"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-black uppercase text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="fullname"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="text-xs font-black uppercase text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="profile-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-black uppercase text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="phone"
                    placeholder="e.g. +977 9801234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-background/50 border-border pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-black uppercase text-muted-foreground">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="address"
                    placeholder="e.g. Kathmandu, Nepal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-background/50 border-border pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Sensitive Check: Require password if email changes */}
              {isEmailChanged && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2 text-yellow-500 text-xs font-bold uppercase">
                    <Shield className="h-4 w-4 shrink-0" />
                    Security Verification Required
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold">
                    You are changing your email address. Please verify your identity by entering your current password.
                  </p>
                  <Input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPasswordForSensitive}
                    onChange={(e) => setCurrentPasswordForSensitive(e.target.value)}
                    className="bg-background/70 border-yellow-500/30 focus-visible:ring-yellow-500 rounded-xl"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={infoLoading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl mt-6 py-5 gap-2"
              >
                {infoLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Save className="h-4.5 w-4.5" />
                )}
                Save Personal Info
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Password Change Panel */}
        <Card className="bg-card/40 border-border rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground mt-0.5">
              Change your password using secure authentication protocols.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-5">
              {securitySuccess && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-semibold">{securitySuccess}</span>
                </div>
              )}
              {securityError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-semibold">{securityError}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="curr-pass" className="text-xs font-black uppercase text-muted-foreground">Current Password</Label>
                <div className="relative">
                  <Input
                    id="curr-pass"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-border pr-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs font-black uppercase text-muted-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-pass"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-border pr-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" className="text-xs font-black uppercase text-muted-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-pass"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-border pr-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist & Bar */}
              {newPassword && (
                <div className="space-y-3.5 p-4 bg-muted/40 border border-border rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold uppercase">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span className={strength.label === "Strong" ? "text-emerald-500" : strength.label === "Medium" ? "text-yellow-500" : "text-red-500"}>
                      {strength.label}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted border border-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${strength.score}%` }} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div className={`flex items-center gap-1.5 ${passCriteria.length ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                      {passCriteria.length ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      8+ Characters
                    </div>
                    <div className={`flex items-center gap-1.5 ${passCriteria.uppercase ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                      {passCriteria.uppercase ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      1 Uppercase Letter
                    </div>
                    <div className={`flex items-center gap-1.5 ${passCriteria.lowercase ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                      {passCriteria.lowercase ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      1 Lowercase Letter
                    </div>
                    <div className={`flex items-center gap-1.5 ${passCriteria.number ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                      {passCriteria.number ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                      1 Number
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={securityLoading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl mt-6 py-5 gap-2"
              >
                {securityLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <KeyRound className="h-4.5 w-4.5" />
                )}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
