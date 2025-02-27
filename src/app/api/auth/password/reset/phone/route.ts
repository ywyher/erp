import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// Use environment variables to store sensitive data securely
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// Define the handler for POST requests
export async function POST(req: NextRequest) {
  try {
    const { value, url, name } = await req.json();

    console.log(value, url, name);

    // Check for required parameters
    if (!value || !url || !name) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 },
      );
    }

    // Send the verification code via SMS
    // const message = await client.messages.create({
    //     body: `Hi ${name},\n\nClick the link below to reset your password:\n\n${url}`,
    //     from: twilioPhoneNumber,
    //     to: `+2${value}`,
    // });

    return NextResponse.json({ success: true, message: "message" });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
