# Homeway Electrical — Website

A modern, responsive business + team portfolio website for **Homeway Electrical**, a residential electrical installation and maintenance service based in Binangonan, Rizal, Philippines.

**Design identity:** dark navy background · gold/yellow accents · electric-blue glow · animated grid & circuit background · rounded cards · Inter + Montserrat typography.

---

## ✅ Completed Features

### Navigation
- Sticky, blurred header with **logo + "HOMEWAY ELECTRICAL" brand name + tagline**
- Menu: Home · Services · How It Works · Our Team · About · Contact
- Highlighted **Book a Home Visit** button
- Mobile hamburger menu with animated icon and slide-in panel (≤ 880px)
- Active-section highlighting while scrolling, back-to-top button, skip link

### Home page sections
1. **Hero** — centered logo, brand name, "Residential Installation • Maintenance", headline, supporting text, *View Our Services* / *Book a Home Visit* buttons, animated SVG circuit pulses, and 5 quick-action tiles (Book a Home Visit, Request Electrical Service, Schedule an Inspection, Contact an Electrician, View Our Team)
2. **Our Electrical Services** — 9 service cards with icons, summaries, bullet previews and **Learn More** → detail modal with *Request This Service* / *Book a Home Visit* (pre-fills the contact form)
3. **Why Choose Homeway Electrical** — 6 feature cards + statement
4. **How It Works** — 4-step process (horizontal on desktop, vertical timeline on mobile)
5. **Our Team** — 5 cards: Jhon Laurence M. Padillo (confirmed info) + 4 honest placeholders (no invented details). Each has **View Profile** and **View Resume**
6. **About** — company description + 6 values
7. **Safety Notice** — prominent gold warning box
8. **Contact** — phone, email, Facebook, location (public: *Binangonan, Rizal, Philippines*), service hours, and a form (Full Name, Email, Phone, Service Needed, Preferred Schedule, Message) with **Send Service Request** and **Book a Home Visit** buttons
9. **Footer** — logo, tagline, navigation, contact, Facebook, Safety Notice link, Privacy Policy & Terms of Service placeholders (modal), copyright

### Resume viewer
- Modal resume viewer with two-column layout (stacked on mobile)
- Full resume for Jhon Laurence M. Padillo: name, position, photo placeholder, career objective, specialization, education, certification, skills, work experience, contact info
- Placeholder members show: *"Resume not yet available. Please check back soon."*
- **Download Resume** → opens the browser print dialog with a print-only stylesheet (save as PDF); **Close** button

### Accessibility & UX
- Semantic HTML, ARIA labels/roles, focus trapping in modals, Escape to close
- Visible focus states, high-contrast text, alt text on images
- `prefers-reduced-motion` support (animations disabled)
- Scroll-reveal animations, smooth scrolling, SEO title/meta description

---

## 🔗 Entry Points

| Path | Description |
|------|-------------|
| `index.html` | Single-page site. Anchors: `#home`, `#services`, `#how-it-works`, `#team`, `#about`, `#safety`, `#contact` |
| `tables/service_requests` | REST endpoint used by the contact form (POST) |

---

## 🗄️ Data Model

**Table: `service_requests`** (contact form submissions)

| Field | Type | Notes |
|-------|------|-------|
| id | text | auto |
| full_name | text | required |
| email | text | required |
| phone | text | required |
| service_needed | text | required (dropdown) |
| message | rich_text | required |
| preferred_schedule | text | datetime-local value |
| request_type | text | `service_request` \| `home_visit` |
| status | text | `new` \| `contacted` \| `scheduled` \| `completed` |

If the API is unreachable, the form falls back to a pre-filled `mailto:` link and phone number so no request is lost.

---

## 📁 Project Structure

```
index.html          Main page
css/style.css       Theme, layout, responsive, reduced-motion, print (resume)
js/data.js          All site content (services, team, values, legal text) — edit here
js/main.js          Rendering, nav, modals, resume viewer, form handling
images/logo.svg     Homeway Electrical logo (house + lightning bolt, gold/blue on navy)
docs/prompt.md      Original website brief
```

---

## 🚧 Not Yet Implemented
- Real photos for team members (initials/placeholder avatars used)
- Actual information and resumes for Team Members 2–5
- Final Privacy Policy and Terms of Service text
- Direct Facebook page URL (currently links to a Facebook search for the name)
- Email notification when a request is submitted (needs a backend/automation)

## 🔜 Recommended Next Steps
1. Replace the SVG logo with the official prototype logo file if a PNG/SVG is available
2. Add team members' details in `js/data.js` (set `hasProfile` / `hasResume` to `true`)
3. Add real profile photos (`images/team/…`) and reference them in the data file
4. Provide the official Facebook page link
5. Optionally attach downloadable PDF resumes per member
6. Publish via the **Publish tab**

## 🔒 Privacy Note
The exact home address is shown **only inside the resume viewer**, per the brief. The public site shows *Binangonan, Rizal, Philippines*. Remove `contact.location` in `js/data.js` if it should not be displayed at all.
