
import { useEffect } from "react";
import { useRouter } from "react-router-dom";

// This component is now just a redirect to the new settings page
const Settings = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.navigate("/settings");
  }, [router]);
  
  return null;
};

export default Settings;
