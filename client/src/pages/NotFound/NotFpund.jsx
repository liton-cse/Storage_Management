import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import { useAuth } from "../../context/AuthContext";
const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/");
    }
  };
  return (
    <div className="not-found-area">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={handleClick} className="not-found-button">
        {user ? "Go to Home" : "Go To Login"}
      </button>
    </div>
  );
};

export default NotFoundPage;
