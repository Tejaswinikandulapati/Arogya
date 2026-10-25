require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "appointments.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf8");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

function readAppointments() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch { return []; }
}
function writeAppointments(rows) {
  const temp = DB_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(rows, null, 2), "utf8");
  fs.renameSync(temp, DB_FILE);
}
function clean(s, max=200) { return String(s ?? "").trim().slice(0, max); }
function validEmail(s) { return !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function validDateTime(s) {
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now() - 60 * 60 * 1000;
}

async function notifyEmail(appointment, status) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
    return { sent: false, reason: "Email not configured; appointment was saved." };
  }
  if (!appointment.email) return { sent: false, reason: "No patient email supplied." };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: appointment.email,
    subject: `Arogya appointment ${status}: ${appointment.id}`,
    text: `Hello ${appointment.patientName},\n\nYour appointment request with ${appointment.doctor} on ${appointment.dateTime} is now ${status}.\nBooking ID: ${appointment.id}\n\nThis is an automated message from Arogya.`
  });
  return { sent: true };
}
async function notifyWhatsApp(appointment, status) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneId || !template) return { sent: false, reason: "WhatsApp not configured; appointment was saved." };
  if (!appointment.phone) return { sent: false, reason: "No patient phone supplied." };
  const phone = appointment.phone.replace(/[^\d]/g, "");
  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
        components: [{ type: "body", parameters: [
          { type: "text", text: appointment.patientName },
          { type: "text", text: appointment.id },
          { type: "text", text: appointment.doctor },
          { type: "text", text: appointment.dateTime },
          { type: "text", text: status }
        ]}]
      }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || "WhatsApp API request failed");
  return { sent: true };
}
async function sendNotifications(appt, status) {
  const results = {};
  try { results.email = await notifyEmail(appt, status); }
  catch (e) { results.email = { sent: false, reason: e.message }; }
  try { results.whatsapp = await notifyWhatsApp(appt, status); }
  catch (e) { results.whatsapp = { sent: false, reason: e.message }; }
  return results;
}

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "Arogya", storage: "persistent JSON file" }));
app.get("/api/appointments", (_req, res) => {
  const rows = readAppointments().sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));
  res.json(rows);
});
app.post("/api/appointments", async (req, res) => {
  const patientName = clean(req.body.patientName, 100);
  const email = clean(req.body.email, 160);
  const phone = clean(req.body.phone, 30);
  const doctor = clean(req.body.doctor, 100);
  const specialty = clean(req.body.specialty, 100);
  const dateTime = clean(req.body.dateTime, 40);
  const reason = clean(req.body.reason, 500);
  if (!patientName || !doctor || !specialty || !dateTime) return res.status(400).json({ error: "Patient name, doctor, specialty and date/time are required." });
  if (!validEmail(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!validDateTime(dateTime)) return res.status(400).json({ error: "Choose a future appointment date and time." });
  const rows = readAppointments();
  const conflict = rows.some(a => a.doctor === doctor && a.dateTime === dateTime && !["Cancelled","Rejected"].includes(a.status));
  if (conflict) return res.status(409).json({ error: "That doctor already has an appointment at this time. Please choose another slot." });
  const appointment = {
    id: "ARG-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
    patientName, email, phone, doctor, specialty, dateTime, reason,
    status: "Pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  rows.push(appointment); writeAppointments(rows);
  const notifications = await sendNotifications(appointment, "Pending");
  res.status(201).json({ appointment, notifications });
});
app.patch("/api/appointments/:id", async (req, res) => {
  const allowed = ["Pending", "Approved", "Rejected", "Completed", "Cancelled"];
  const status = clean(req.body.status, 30);
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid appointment status." });
  const rows = readAppointments();
  const index = rows.findIndex(a => a.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Appointment not found." });
  rows[index].status = status;
  rows[index].updatedAt = new Date().toISOString();
  writeAppointments(rows);
  const notifications = await sendNotifications(rows[index], status);
  res.json({ appointment: rows[index], notifications });
});
app.delete("/api/appointments/:id", (req, res) => {
  const rows = readAppointments();
  const index = rows.findIndex(a => a.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Appointment not found." });
  if (["Approved","Completed"].includes(rows[index].status)) return res.status(409).json({ error: "Approved or completed appointments cannot be deleted from this demo. Ask the clinic to cancel it." });
  rows.splice(index, 1); writeAppointments(rows);
  res.json({ ok: true });
});
app.listen(PORT, () => console.log(`Arogya is running at http://localhost:${PORT}`));
