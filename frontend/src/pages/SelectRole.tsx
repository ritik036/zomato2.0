import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";

type Role = "customer" | "seller" | "rider" | null;

function SelectRole() {
  const [role, setRole] = useState<Role | null>(null);
  const { setUser } = useAppData();
  const Navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    try {
      const { data } = await axios.post(
        `${authService}/api/auth/add/role`,
        {
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      Navigate("/", { replace: true });
    } catch (error) {}
  };

  return <div>Select Role</div>;
}

export default SelectRole;
