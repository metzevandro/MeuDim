import React from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

interface GoogleButtonProps {
  content: string;
}
const GoogleButton = (props: GoogleButtonProps) => {
  const onClick = (provider: "google") => {
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div
      onClick={() => onClick("google")}
      tabIndex={0}
      className="button secondary md"
    >
      <FcGoogle />
      <p>{props.content}</p>
    </div>
  );
};

export default GoogleButton;
