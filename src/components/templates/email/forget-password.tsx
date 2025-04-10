import * as React from "react";

interface TForgetPassowrdEmailTemplate {
  url: string;
}

export const ForgetPassowrdEmailTemplate: React.FC<
  Readonly<TForgetPassowrdEmailTemplate>
> = ({ url }) => (
  <div>
    <a href={url}>Click Here To Reset</a>
    <p>{url}</p>
  </div>
);
