"use client";

import Check from "@/components/auth/check";
import { useEffect, useState } from "react";
import Register from "@/components/auth/register";
import Login from "@/components/auth/login";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Verify from "@/components/auth/verify";

export type AuthPort = "check" | "register" | "login" | "verify"
export type AuthIdentifier = "email" | "phoneNumber" | "username"

export default function Auth() {
  const [port, setPort] = useState<AuthPort>("check");
  const [identifierValue, setIdentifierValue] = useState<string>("")
  const [identifier, setIdentifier] = useState<AuthIdentifier | null>(null)
  const [password, setPassword] = useState<string>("")
  const [open, setOpen] = useState<boolean>(true)

  useEffect(() => {
    console.log(identifier, identifierValue, port, password)
  }, [identifier, identifierValue, port, password])

  const handleGoBack = () => {
    setPort("check");
  };

  return (
    <div>
      {(port === "register" || port === "login") && (
        <Button
          variant="link"
          className="p-0 text-sm m-0"
          onClick={handleGoBack}
        >
          <ArrowLeft size={12} /> Go Back
        </Button>
      )}
      {port === "check" && (
        <Check 
          setPort={setPort}
          setIdentifierValue={setIdentifierValue}
          setIdentifier={setIdentifier}
        /> 
      )}
      {port === "register" && (
        <Register
          email={identifierValue}
          setPort={setPort}
          setPassword={setPassword}
        />
      )}
      {port == 'login' && (
        <Login setPort={setPort} setPassword={setPassword} identifierValue={identifierValue} identifier={identifier as AuthIdentifier} setOpen={setOpen} />
      )}
      {port == 'verify' && (
        <Verify setPort={setPort} identifierValue={identifierValue} identifier={identifier as AuthIdentifier} password={password} setOpen={setOpen} /> 
      )}
    </div>
  );
}