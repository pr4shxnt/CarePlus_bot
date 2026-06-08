import React, { useState, useEffect } from "react";
import { Check, Eye, EyeOff } from "lucide-react";

const DIAGNOSIS_OPTIONS = [
  { id: "alzheimers", label: "Alzheimer's / Dementia" },
  { id: "parkinsons", label: "Parkinson's Disease" },
  { id: "hypertension", label: "Hypertension (High Blood Pressure)" },
  { id: "diabetes", label: "Diabetes" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "arthritis", label: "Arthritis" },
  { id: "cognitive_reminders", label: "Memory / Cognitive Reminders" },
  { id: "other", label: "Other / Specify..." }
];

export const Registration = () => {
  const [role, setRole] = useState("guardian");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [otherDiagnosisText, setOtherDiagnosisText] = useState("");

  const handleDiagnosisToggle = (label) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    licenseNumber: "",
    relationship: "",
    patientName: "",
    dob: "",
    gender: "",
    healthGoal: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const res = await fetch(
        "https://skkcg1pw-4000.inc1.devtunnels.ms/api/auth/verify-google-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: response.credential }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, email: data.email }));
        setIsEmailVerified(true);
      } else {
        alert(data.error || "Google email verification failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the verification server.");
    }
  };

  useEffect(() => {
    const checkGoogle = () => {
      if (window.google) {
        setGoogleLoaded(true);
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
  }, []);

  useEffect(() => {
    if (googleLoaded && !isEmailVerified) {
      const btn = document.getElementById("google-verify-btn");
      if (btn && btn.children.length === 0) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "44430947651-mmos6g35gibdn6bejvfkk8am8322m1tn.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });
          window.google.accounts.id.renderButton(
            btn,
            { theme: "outline", size: "large", text: "continue_with" }
          );
        } catch (err) {
          console.error("Error rendering Google button:", err);
        }
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      alert("Please verify your email address using Google verification first.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
    };

    if (role === "doctor") {
      payload.specialization = formData.specialization;
      payload.licenseNumber = formData.licenseNumber;
    } else if (role === "guardian") {
      payload.relationship = formData.relationship;
      payload.patientName = formData.patientName;
      payload.gender = formData.gender;
      
      payload.conditions = selectedDiagnoses.filter(item => item !== "Other / Specify...");
      if (selectedDiagnoses.includes("Other / Specify...")) {
        payload.healthGoal = otherDiagnosisText.trim();
      } else {
        payload.healthGoal = "";
      }

      if (formData.dob) {
        const birthDate = new Date(formData.dob);
        payload.age = new Date().getFullYear() - birthDate.getFullYear();
      }
    }

    try {
      const response = await fetch(
        "https://skkcg1pw-4000.inc1.devtunnels.ms/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      if (result.success) {
        alert(
          "Registration successful! You can now log in to the CarePlus app.",
        );
      } else {
        alert(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(
        "An error occurred during registration. Please check if the server is running.",
      );
    }
  };

  return (
    <section className="registration-page">
      <div className="reg-container">
        <div className="reg-header">
          <span className="section-badge">Get Started</span>
          <h2 className="section-title-dark">Create Your CarePlus Profile</h2>
          <p>Join the next generation of personalized healthcare.</p>
        </div>
        <form
          className="main-reg-form"
          id="registration-form"
          onSubmit={handleSubmit}
        >
          {/* Basic Fields for All Users */}
          <div className="form-group">
            <label htmlFor="full-name">Full Name</label>
            <input
              type="text"
              id="full-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isEmailVerified ? "" : "Verify email below"}
                required
                disabled={true}
                style={{ flex: 1, backgroundColor: "#f5f5f5", color: "#666", cursor: "not-allowed" }}
              />
              {isEmailVerified && (
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#e6f4ea", border: "2px solid #34a853" }}>
                  <Check style={{ color: "#34a853", width: "22px", height: "22px" }} />
                </div>
              )}
            </div>
            {!isEmailVerified && (
              <div style={{ marginTop: "10px" }}>
                <div id="google-verify-btn"></div>
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role-select">I am a...</label>
            <select
              id="role-select"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="guardian">Guardian</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Section: Doctor Specific Fields */}
          {role === "doctor" && (
            <div id="section-doctor" className="role-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Cardiologist, Neurologist"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="license-number">Medical License Number</label>
                  <input
                    type="text"
                    id="license-number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. NMC-12345"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Guardian Specific Fields */}
          {role === "guardian" && (
            <div id="section-guardian" className="role-section">
              <h3
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  fontWeight: 800,
                  color: "var(--text-dark)",
                  borderBottom: "2px solid #eee",
                  paddingBottom: 8,
                  fontSize: "1.3rem",
                }}
              >
                Guardian & Patient Details
              </h3>

              <div className="form-group">
                <label htmlFor="relationship">Relationship to Patient</label>
                <input
                  type="text"
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  placeholder="e.g. Son, Daughter, Spouse"
                  required
                />
              </div>

              <h4
                style={{
                  marginTop: 25,
                  marginBottom: 15,
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  fontSize: "1.1rem",
                }}
              >
                Patient Details
              </h4>

              <div className="form-group">
                <label htmlFor="patient-name">Patient's Full Name</label>
                <input
                  type="text"
                  id="patient-name"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient's full name"
                  required
                />
              </div>

              <div className="form-row" style={{ marginTop: 20 }}>
                <div className="form-group">
                  <label htmlFor="patient-dob">Patient's Date of Birth</label>
                  <input
                    type="date"
                    id="patient-dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="patient-gender">Patient's Gender</label>
                  <select
                    id="patient-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 20 }}>
                <label>Patient's Health Notes / Diagnosis</label>
                <div className="diagnosis-grid">
                  {DIAGNOSIS_OPTIONS.map((option) => {
                    const isSelected = selectedDiagnoses.includes(option.label);
                    return (
                      <label
                        key={option.id}
                        className={`diagnosis-card ${isSelected ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDiagnosisToggle(option.label)}
                          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                        />
                        <div className="checkbox-indicator">
                          <Check />
                        </div>
                        <span className="diagnosis-label">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {selectedDiagnoses.includes("Other / Specify...") && (
                  <div className="other-diagnosis-wrapper">
                    <input
                      type="text"
                      className="other-diagnosis-input"
                      placeholder="Please specify patient's notes / diagnosis"
                      value={otherDiagnosisText}
                      onChange={(e) => setOtherDiagnosisText(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-footer">
            <p className="terms">
              By registering, you agree to our <a href="#">Terms of Service</a>{" "}
              and <a href="#">Privacy Policy</a>.
            </p>
            <button type="submit" className="cta-btn-dark">
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
