# Design Document: Care+ (CarePlus) Landing Page

## 1. Overview
**Care+** is an AI-driven healthcare companion designed for elderly home care in Nepal. This landing page aims to build trust, showcase innovative AI features, and provide a seamless experience for both local caregivers and families abroad.

## 2. Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Vanilla CSS for custom components where needed)
- **Animations:** Framer Motion (Scroll reveal, hover effects)
- **Icons:** Lucide-react
- **Fonts:** Inter (System sans-serif for clean, professional look)

## 3. Visual Identity
- **Palette:** 
  - Primary: `bg-blue-600` / `text-blue-600` (Trust, Medical)
  - Secondary: `bg-teal-500` / `text-teal-500` (Subtle green accents, Health/Warmth)
  - Background: `bg-slate-50` / `bg-white` (Clean, sterile but warm)
  - Text: `text-slate-900` (High readability)
- **Elements:**
  - Rounded cards (`rounded-3xl`)
  - Soft shadows (`shadow-xl shadow-blue-100/50`)
  - Glassmorphism effects for the Navbar and specific UI elements.

## 4. Components & Structure

### 4.1 Navbar
- Logo: "Care+" (Bold blue with a green '+' icon)
- Links: Features, How It Works, Who It's For
- CTA: "Early Access" (Button)

### 4.2 Hero
- Heading: "Your AI-Powered Home Health Companion"
- Subtext: Focus on elderly care in Nepal, bridging the gap between families and health.
- Visual: A 3D-style illustration or a high-quality mockup of the app dashboard.
- CTA: "Get Early Access" (Primary), "Watch Video" (Secondary)

### 4.3 Problem Section
- Grid layout highlighting:
  - Language Barriers (English vs Nepali AI)
  - Medicine Adherence (Missed doses)
  - Distance (Families abroad feeling disconnected)
  - Complexity of elderly care.

### 4.4 Features (Feature Cards)
- **Nepali Voice AI:** Speak in Nepali, AI understands.
- **Medicine Tracking:** Smart reminders and logging.
- **Mood Analysis:** Tracking emotional well-being.
- **Role Dashboards:** Specific views for Doctor, Guardian, Caregiver, Patient.
- **Health Reports:** Automated PDF/Web reports.

### 4.5 How It Works (Step-by-Step)
1. **Speak:** Elderly person talks to the companion.
2. **Transcribe:** Real-time speech-to-text in Nepali.
3. **AI Processes:** Analyzing needs, medical context, or mood.
4. **Act & Notify:** Reminders set or notifications sent to family/doctors.

### 4.6 Who It's For
- 4 Cards: Elderly Patients, Remote Family, Home-care Nurses, Doctors.

### 4.7 SDG Alignment
- Display badges for SDG 3 (Good Health), SDG 9 (Industry, Innovation), SDG 10 (Reduced Inequalities).

### 4.8 Footer
- Links, Copyright, "Team Git Force", "Innovation Fest 2026".

## 5. Strategy for Implementation
1. Initialize Next.js project with Tailwind.
2. Setup global styles and layout.
3. Build components section-by-section using Framer Motion for entry animations.
4. Ensure full responsiveness (Mobile/Tablet/Desktop).
5. Final polish: Hover states, accessibility (aria-labels), and performance optimization.

## 6. Feedback & Approval
Please review this design document. Once approved, I will proceed with initialization and implementation.
