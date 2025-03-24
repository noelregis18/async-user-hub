
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import { authService } from "@/services/auth.service";

const Login = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isLoggedIn()) {
        const user = authService.getCurrentUser();
        if (user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="h-10 w-10 bg-primary rounded-md"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome to AuthApp
        </h1>
        <p className="text-muted-foreground max-w-md">
          Sign in to access your dashboard and manage your records
        </p>
      </motion.div>

      <LoginForm />
    </div>
  );
};

export default Login;
