export const RegistrationView = () => `
      <section class="registration-page">
        <div class="reg-container">
            <div class="reg-header">
                <span class="section-badge">Get Started</span>
                <h2 class="section-title-dark">Create Your CarePlus Profile</h2>
                <p>Join the next generation of personalized healthcare.</p>
            </div>
            <form class="main-reg-form" id="registration-form">
                <div class="form-group">
                    <label for="full-name">Full Name</label>
                    <input type="text" id="full-name" name="full-name" placeholder="John Doe" required />
                </div>
                <div class="form-group">
                    <label for="reg-email">Email Address</label>
                    <input type="email" id="reg-email" name="reg-email" placeholder="john@example.com" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="dob">Date of Birth</label>
                        <input type="date" id="dob" name="dob" required />
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender" required>
                            <option value="" disabled selected>Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="health-goal">Primary Health Goal</label>
                    <textarea id="health-goal" name="health-goal" placeholder="e.g., Manage stress, Improve sleep, Monitor chronic condition"></textarea>
                </div>
                <div class="form-footer">
                    <p class="terms">By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
                    <button type="submit" class="cta-btn-dark">Complete Registration</button>
                </div>
            </form>
        </div>
      </section>
`;
