// import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../utility/api.js";
import { useNavigate } from "react-router-dom";

const GoogleLogin = () => {
  //const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        const { email, name } = result.data.user;
        const token = result.data.token;
        const obj = { email, name, token };
        localStorage.setItem("user-info", JSON.stringify(obj));
        navigate("/home");
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      console.log("Error while Google Login...", e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <>
      <div>
        <button onClick={googleLogin} className="google-signin-link">
          <img src="Google_logo.png" alt="logo" /> Sign in with Google
        </button>
      </div>
    </>
  );
};

export default GoogleLogin;
