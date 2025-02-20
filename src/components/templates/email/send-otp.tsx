import * as React from 'react';

interface SendOtpEmailTemplate {
    firstName: string;
    otp: string;
}

export const SendOtpEmailTemplate = ({
    firstName,
    otp
}: SendOtpEmailTemplate) => (
    <div>
        <h1>Welcome, {firstName}!</h1>
        <p>Your OTP is: {otp}</p>
    </div>
);