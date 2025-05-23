import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";

const GoogleLogin = () => {
  const { googleLoginFunction } = useAuth();
  // Get the correct redirect URI based on environment
  // const getRedirectUri = () => {
  //   return window.location.origin; // Dynamically gets current origin (localhost or production)
  // };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      try {
        const response = await googleLoginFunction(code);
        if (!response.data?.token) {
          throw new Error("Authentication failed - no token received");
        }
        localStorage.setItem("token", response.data.token);

        window.location.href = "/";
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
    },
    flow: "auth-code",
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_FRONTEND_URL,
    scope: "openid profile email",
  });
  return (
    <button onClick={googleLogin} className="google-signin-link">
      <img src="Google_logo.png" alt="Google logo" />
      Sign in with Google
    </button>
  );
};

export default GoogleLogin;
