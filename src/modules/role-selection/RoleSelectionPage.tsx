import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import RoleCard from "./components/RoleCard";
import { Heart, Stethoscope } from "lucide-react";

export default function RoleSelectionPage() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const handleSelect = (selectedRole: "user" | "doctor") => {
    setRole(selectedRole);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Welcome to SwasthyaSakhi
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-xl mx-auto">
          Choose how you want to use the platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard
            icon={<Heart className="w-12 h-12" />}
            title="User"
            subtitle="Track and manage women's health journey phases."
            selected={role === "user"}
            onClick={() => handleSelect("user")}
            accentColor="primary"
          />
          <RoleCard
            icon={<Stethoscope className="w-12 h-12" />}
            title="Doctor"
            subtitle="Monitor and assist patients with healthcare insights."
            selected={role === "doctor"}
            onClick={() => handleSelect("doctor")}
            accentColor="teal"
          />
        </div>
      </div>
    </div>
  );
}
