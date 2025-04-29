import React from "react";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const { signupUser } = useAuth();

  return (
    <div>
      <AuthForm type="signup" onSubmit={signupUser} />
    </div>
  );
};

export default Signup;
