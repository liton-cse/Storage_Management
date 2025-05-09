import { useNavigate } from "react-router-dom";
import "./NotFound.css";
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="not-found-area">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} className="not-found-button">
        Go to Home
      </button>
    </div>
  );
};

export default NotFoundPage;
