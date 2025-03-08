
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component is now just a redirect to the new settings page
const Settings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/settings");
  }, [navigate]);
  
  return null;
};

export default Settings;
