import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";

const GoogleLogin = () => {
  const { googleLoginFunction } = useAuth();
  // Get the correct redirect URI based on environment
  const getRedirectUri = () => {
    return window.location.origin; // Dynamically gets current origin (localhost or production)
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      try {
        const response = await googleLoginFunction(code);

        if (!response.data?.token) {
          throw new Error("Authentication failed - no token received");
        }
        // email: response.data.user.email,
        // name: response.data.user.name,
        // picture: response.data.user.picture,
        localStorage.setItem("token", response.data.token);

        window.location.href = "/home";
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
    },
    flow: "auth-code",
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    // ux_mode: "redirect",
    redirect_uri: getRedirectUri(),
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
