import { DynamicForm } from "../components/DynamicForm";
import type { FormConfig } from "../types/form";
import { Container } from "@mui/material";

// Example form configuration - can be loaded from API or file
const formConfig: FormConfig = {
  data: [
    {
      id: 1,
      name: "Full Name",
      fieldType: "TEXT",
      minLength: 1,
      maxLength: 100,
      defaultValue: "John Doe",
      required: true,
    },
    {
      id: 2,
      name: "Email",
      fieldType: "TEXT",
      minLength: 1,
      maxLength: 50,
      defaultValue: "hello@mail.com",
      required: true,
    },
    {
      id: 6,
      name: "Gender",
      fieldType: "LIST",
      defaultValue: "1",
      required: true,
      listOfValues1: ["Male", "Female", "Others"],
    },
    {
      id: 7,
      name: "Love React?",
      fieldType: "RADIO",
      defaultValue: "1",
      required: true,
      listOfValues1: ["Yes", "No"],
    },
  ],
};

export const FormPage = () => {
  const handleSubmit = (data: Record<string, string | undefined>) => {
    console.log("Form submitted with data:", data);
    // You can add API call here to submit the form data
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <DynamicForm config={formConfig} onSubmit={handleSubmit} />
    </Container>
  );
};
