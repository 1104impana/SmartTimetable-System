# SmartTimetable-System
AI-powered Academic Timetable Generator aligned with NEP 2020. Automates multidisciplinary scheduling for FYUP, B.Ed., M.Ed., and ITEP programs — resolving conflicts, balancing faculty workload, and adapting to flexible credit structures.
---

## Features

* Generate timetables for multiple **batches** based on course selections
* Prevents **teacher**, **room**, and **batch** scheduling conflicts
* Supports **Theory** and **Practical** classes with correct room allocation
* Distributes classes across the week to avoid overload
* Tries to **avoid lunch break slot (13:00–14:00)** when possible
* Allows **easy input** of courses, faculty, and rooms
* Uses **AI (Gemini)** to *explain conflicts* and *suggest alternatives*

---

## Tech Stack

| Category         | Technology                                    |
| ---------------- | --------------------------------------------- |
| Frontend UI      | React + Vite + TypeScript                     |
| AI Reasoning     | Google Gemini API                             |
| Scheduling Logic | Greedy + Constraint-based Timetable Algorithm |
| Styles           | CSS / Tailwind (optional)                     |

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/1104impana/SmartTimetable-System.git
cd <SmartTimetable-System>
```

### 2. Create `.env.local`

```
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open in Browser

```
http://localhost:5173
```

### 6. Login (Demo Credentials)

| Username | Password |
| -------- | -------- |
| admin    | 1234     |

---

## Future Enhancements

* Add real user authentication (Supabase / Firebase)
* Export timetable to **PDF / Excel**
* Auto-optimize faculty workload distribution
* Add student portal-based batch creation

---

## Team & Contribution

This project was built collaboratively for hackathon demonstration and can be extended for real institutional deploy
