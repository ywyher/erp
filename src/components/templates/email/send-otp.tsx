import * as React from "react";

interface SendOtpEmailTemplate {
  otp: string;
}

export const SendOtpEmailTemplate = ({
  otp,
}: SendOtpEmailTemplate) => (
  <div>
    <p>Your OTP is: {otp}</p>
  </div>
);
