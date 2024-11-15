import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Use environment variables to store sensitive data securely
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// Define the handler for POST requests
export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, code } = await request.json();

        // Check for required parameters
        if (!phoneNumber || !code) {
            return NextResponse.json({ error: 'Phone number and verification code are required' }, { status: 400 });
        }

        // Send the verification code via SMS
        const message = await client.messages.create({
            body: `Your verification code is: ${code}`,
            from: twilioPhoneNumber,
            to: `+2${phoneNumber}`,
        });

        return NextResponse.json({ success: true, messageSid: message.sid });
    } catch (error) {
        console.error('Error sending SMS:', error);
        return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
    }
}
