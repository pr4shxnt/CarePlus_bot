import React, { useState } from "react";

export const Registration = () => {
  const [role, setRole] = useState("guardian");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      payload.healthGoal = formData.healthGoal;
      if (formData.dob) {
        const birthDate = new Date(formData.dob);
        payload.age = new Date().getFullYear() - birthDate.getFullYear();
      }
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert("Registration successful! You can now log in to the CarePlus app.");
      } else {
        alert(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during registration. Please check if the server is running.");
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
        <form className="main-reg-form" id="registration-form" onSubmit={handleSubmit}>
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
            <input
              type="email"
              id="reg-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                required
                minLength={8}
              />
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
              <h3 style={{ marginTop: 20, marginBottom: 20, fontWeight: 800, color: "var(--text-dark)", borderBottom: "2px solid #eee", paddingBottom: 8, fontSize: "1.3rem" }}>
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
              
              <h4 style={{ marginTop: 25, marginBottom: 15, fontWeight: 700, color: "var(--text-dark)", fontSize: "1.1rem" }}>
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
                    <option value="" disabled>Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: 20 }}>
                <label htmlFor="patient-health-goal">Patient's Health Notes / Diagnosis</label>
                <textarea
                  id="patient-health-goal"
                  name="healthGoal"
                  value={formData.healthGoal}
                  onChange={handleChange}
                  placeholder="e.g., Early-stage Alzheimer's, Hypertension, needs memory reminders"
                />
              </div>
            </div>
          )}

          <div className="form-footer">
            <p className="terms">
              By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
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
