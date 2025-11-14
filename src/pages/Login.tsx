import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { DynamicForm } from "../components/DynamicForm";
import { findUserByEmail, setLoggedIn, setCurrentUser } from "../utils/storage";
import { loadFormConfig } from "../utils/configLoader";

// Load login form configuration from JSON file
const loginFormConfig = loadFormConfig("login");

export const Login = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (data: Record<string, string | undefined>) => {
    const email = data["Email"]?.trim() || "";
    const password = data["Password"] || "";

    // Check credentials
    const user = findUserByEmail(email);

    if (!user) {
      setErrorMessage("Invalid email or password");
      return;
    }

    if (user.password !== password) {
      setErrorMessage("Invalid email or password");
      return;
    }

    // Login successful
    setLoggedIn(true);
    setCurrentUser(user);
    setShowSuccess(true);

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
        margin: 0,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", mx: "auto" }}>
        <CardContent sx={{ p: 4 }}>
          <DynamicForm
            config={loginFormConfig}
            onSubmit={handleSubmit}
            autoSave={false}
            showResetButton={false}
            submitButtonText="Login"
            title="Login"
            subtitle="Sign in to your account"
          />
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ textDecoration: "none" }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Login successful! Redirecting to dashboard...
        </Alert>
      </Snackbar>

      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={4000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};
