# Eventora - Full-Stack Event Booking Platform

Eventora is a full-stack MERN application that lets users effortlessly browse, sign up for, and pay for events natively, with no reliance on third-party tools. It includes an admin dashboard where event organizers can create and manage both free and paid events. Admins can also manually manage all bookings to handle payments directly.

## Features
- **User Authentication: Secure sign-in and account creation powered by JWT and bcrypt.
- **2FA OTP Verification:
A mandatory email OTP is required to activate your account after registration (or if login attempts are delayed).
A mandatory email OTP is also required to complete and secure event ticket bookings.
- **Role-Based Access**: 
  -Admin: Create, edit, and remove events. Approve or decline incoming booking requests, and mark each one as "Paid" or "Not Paid." Access is restricted solely to users flagged as admins in the database.
User: Browse events, submit ticket booking requests via OTP, check pending status from a personal dashboard, and cancel bookings as needed.
- **Event Management**Set up free and paid events with rich descriptions, external image URLs, dates, categories, and seating capacity.
- **Smart Booking System**:
 Every booking request requires a mandatory 2FA OTP for authorization and enters a secure "Pending" queue awaiting admin verification, whether the event is free or paid. Seat availability is updated in real time and checked against overbooking logic to prevent double-booking.
- **Admin Analytics Dashboard**: Monitor live metrics — including pending requests, total revenue, and total confirmed paid clients — directly from the admin panel.
- **Email Notifications**: Automated confirmation emails sent via Nodemailer once a booking is successfully approved.
- **Sleek UI/UX**: Built entirely with React, Tailwind CSS, and polished with micro-interactions.

---

## 🚀 Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
You will also need a MongoDB database (e.g., [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register)).

### 1. Environment Variables Configuration
Navigate to `server/.env` and fill in the necessary keys:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey_eventora
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
```
> **Note**: For `EMAIL_PASS`, you need to generate an "App Password" from your Google Account settings, standard passwords won't work due to 2FA.

### 2. Run from Outer Folder (Single Terminal)
You can now manage both backend and frontend from the project root:

```bash
# from Eventora root
npm install
npm run install:all
npm run dev
```

- `npm run dev` starts both `server` and `client` together using `concurrently`.
- `npm run dev:all` installs dependencies (server + client) and starts both in one command.
- `npm run start` runs backend `start` + frontend `preview` together.

### 3. Install Dependencies
Open two separate terminals for the backend and frontend.

**Backend Terminal:**
```bash
cd server
npm install --legacy-peer-deps
```

**Frontend Terminal:**
```bash
cd client
npm install
```

### 4. Run the Application Local Servers
**Run Backend:**
```bash
cd server
npm run dev
```
*(Server will run on `http://localhost:5000`)*

**Run Frontend:**
```bash
cd client
npm run dev
```
*(Client will run on a local port provided by Vite, typically `http://localhost:5173`)*
