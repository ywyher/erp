import * as React from 'react';

interface TSendOtpEmailTemplate {
    firstName: string;
    otp: string;
}

export const SendOtpEmailTemplate: React.FC<Readonly<TSendOtpEmailTemplate>> = ({
    firstName,
    otp
}) => (
    <div>
        <h1>Welcome, {firstName}!</h1>
        <p>Your OTP is: {otp}</p>
    </div>
);