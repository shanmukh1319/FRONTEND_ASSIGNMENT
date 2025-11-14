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
import { saveUser, findUserByEmail } from "../utils/storage";
import { loadFormConfig } from "../utils/configLoader";

// Load signup form configuration from JSON file
const signupFormConfig = loadFormConfig("signup");

export const Signup = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (data: Record<string, string | undefined>) => {
    // Dynamically extract fields from form data
    const fullName = data["Full Name"]?.trim() || "";
    const email = data["Email"]?.trim() || "";
    const password = data["Password"] || "";
    const gender = data["Gender"] || "";
    const loveReact = data["Love React?"] || "";

    // Additional validation
    if (!fullName) {
      setErrorMessage("Full Name is required");
      return;
    }

    if (!email) {
      setErrorMessage("Email is required");
      return;
    }

    if (findUserByEmail(email)) {
      setErrorMessage("Email already registered");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    // Save user to localStorage
    // Note: Additional fields like Gender and Love React? are captured but
    // only essential fields (fullName, email, password) are saved to user storage
    try {
      saveUser({
        fullName,
        email,
        password,
      });
      // Log additional form data for demonstration
      console.log("Additional form data:", { gender, loveReact });
      setShowSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage("Failed to create account. Please try again.");
    }
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
            config={signupFormConfig}
            onSubmit={handleSubmit}
            autoSave={false}
            showResetButton={false}
            submitButtonText="Sign Up"
            title="Sign Up"
            subtitle="Create your account to get started"
          />
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              Login
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
          Account created successfully! Redirecting to login...
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
