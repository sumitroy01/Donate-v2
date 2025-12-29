import { Navigate } from "react-router-dom";
import userStore from "../store/userstore";

const PublicRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = userStore();

  if (isCheckingAuth) return null;

  if (authUser) return <Navigate to="/" replace />;

  return children;
};

export default PublicRoute;
