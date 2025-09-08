import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setuser] = useState(false);
  const [showLogin, setshowLogin] = useState(false);
  const [token, settoken] = useState(localStorage.getItem("token"));
  const [credit, setcredit] = useState(false);

  const navigate = useNavigate();

  // Auto-switch backend URL
  const backendUrl =
    import.meta.env.MODE === "production"
      ? "https://txtvision-4.onrender.com/" // Render backend URL
      : "http://localhost:8000"; // Local backend

  console.log("Backend URL:", backendUrl);

  const loadCreditData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
        headers: { token },
      });

      if (data.success) {
        setcredit(data.credits);
        setuser(data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const generateImage = async (prompt) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/image/generate-image`,
        { prompt },
        {
          headers: { token },
        }
      );

      if (data.success) {
        loadCreditData();
        return data.resultImage;
      } else {
        toast.error(data.message);
        loadCreditData();
        if (data.creditBalance === 0) {
          navigate("/buy");
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    settoken("");
    setuser(null);
  };

  useEffect(() => {
    if (token) loadCreditData();
  }, [token]);

  const value = {
    user,
    setuser,
    showLogin,
    setshowLogin,
    backendUrl,
    token,
    settoken,
    credit,
    setcredit,
    loadCreditData,
    logout,
    generateImage,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
