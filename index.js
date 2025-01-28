const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

// الاتصال بـ MongoDB
mongoose.connect("mongodb+srv://akar:omer6655@cluster0.yswkyg6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
});

const subscriberSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// إضافة مشترك جديد
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already subscribed" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error subscribing user", error });
  }
});

// إرسال البريد الإلكتروني
app.post("/api/send", async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ message: "Subject and message are required." });
  }

  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      return res.status(400).json({ message: "No subscribers available." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@flipsidewellbeing.org",
        pass: "Flipside$966",
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true,
    });

    const emails = subscribers.map((sub) => sub.email).join(",");
    const mailOptions = {
      from: "info@flipsidewellbeing.org",
      to: emails,
      subject,
      html: `${message} <a href="https://flipsidewellbeing.org">موقعنا</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({ message: "Failed to send emails.", error });
      }

      res.status(200).json({ message: "Emails sent successfully.", info });
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscribers", error });
  }
});

// جلب جميع المشتركين
app.get("/api/subscribers", async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscribers", error });
  }
});

// بدء السيرفر
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
