export const RegistrationView = () => `
      <section class="registration-page">
        <div class="reg-container">
            <div class="reg-header">
                <span class="section-badge">Get Started</span>
                <h2 class="section-title-dark">Create Your CarePlus Profile</h2>
                <p>Join the next generation of personalized healthcare.</p>
            </div>
            <form class="main-reg-form" id="registration-form">
                <!-- Basic Fields for All Users -->
                <div class="form-group">
                    <label for="full-name">Full Name</label>
                    <input type="text" id="full-name" name="name" placeholder="John Doe" required />
                </div>
                <div class="form-group">
                    <label for="reg-email">Email Address</label>
                    <input type="email" id="reg-email" name="email" placeholder="john@example.com" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="********" required minlength="8" />
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" name="confirm-password" placeholder="********" required minlength="8" />
                    </div>
                </div>

                <!-- Role Selection -->
                <div class="form-group">
                    <label for="role-select">I am a...</label>
                    <select id="role-select" name="role" required>
                        <option value="guardian" selected>Guardian</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>

                <!-- Section: Doctor Specific Fields -->
                <div id="section-doctor" class="role-section" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="specialization">Specialization</label>
                            <input type="text" id="specialization" name="specialization" placeholder="e.g. Cardiologist, Neurologist" data-required="true" />
                        </div>
                        <div class="form-group">
                            <label for="license-number">Medical License Number</label>
                            <input type="text" id="license-number" name="licenseNumber" placeholder="e.g. NMC-12345" data-required="true" />
                        </div>
                    </div>
                </div>

                <!-- Section: Guardian Specific Fields -->
                <div id="section-guardian" class="role-section" style="display: none;">
                    <h3 style="margin-top: 10px; margin-bottom: 20px; font-weight: 800; color: var(--text-dark); border-bottom: 2px solid #eee; padding-bottom: 8px; font-size: 1.3rem;">Guardian & Patient Details</h3>
                    
                    <div class="form-group">
                        <label for="relationship">Relationship to Patient</label>
                        <input type="text" id="relationship" name="relationship" placeholder="e.g. Son, Daughter, Spouse" data-required="true" />
                    </div>
                    
                    <h4 style="margin-top: 25px; margin-bottom: 15px; font-weight: 700; color: var(--text-dark); font-size: 1.1rem;">Patient Details</h4>
                    
                    <div class="form-group">
                        <label for="patient-name">Patient's Full Name</label>
                        <input type="text" id="patient-name" name="patientName" placeholder="Enter patient's full name" data-required="true" />
                    </div>
                    
                    <div class="form-row" style="margin-top: 20px;">
                        <div class="form-group">
                            <label for="patient-dob">Patient's Date of Birth</label>
                            <input type="date" id="patient-dob" name="dob" data-required="true" />
                        </div>
                        <div class="form-group">
                            <label for="patient-gender">Patient's Gender</label>
                            <select id="patient-gender" name="gender" data-required="true">
                                <option value="" disabled selected>Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label for="patient-health-goal">Patient's Health Notes / Diagnosis</label>
                        <textarea id="patient-health-goal" name="healthGoal" placeholder="e.g., Early-stage Alzheimer's, Hypertension, needs memory reminders"></textarea>
                    </div>
                </div>

                <div class="form-footer">
                    <p class="terms">By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
                    <button type="submit" class="cta-btn-dark">Complete Registration</button>
                </div>
            </form>
        </div>
      </section>
`;
