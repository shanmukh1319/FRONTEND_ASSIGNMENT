import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import type { FormField, FormConfig } from "../types/form";
import { useEffect } from "react";
import { saveFormData, getFormData } from "../utils/formStorage";

interface DynamicFormProps {
  config: FormConfig;
  onSubmit?: (data: Record<string, string | undefined>) => void;
  autoSave?: boolean; // Enable/disable auto-save to localStorage
  storageKey?: string; // Custom storage key for form data
  showResetButton?: boolean; // Show/hide reset button
  submitButtonText?: string; // Custom submit button text
  title?: string; // Custom form title
  subtitle?: string; // Custom form subtitle
  initialValues?: Record<string, string>; // Initial values for form fields (for editing)
}

export const DynamicForm = ({
  config,
  onSubmit,
  autoSave = true,
  storageKey,
  showResetButton = true,
  submitButtonText = "Submit",
  title,
  subtitle,
  initialValues,
}: DynamicFormProps) => {
  // Build Yup validation schema dynamically
  const buildValidationSchema = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema: Record<string, any> = {};

    config.data.forEach((field) => {
      // Handle number fields differently
      if (field.fieldType === "TEXT" && field.inputType === "number") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fieldSchema: any = yup
          .mixed()
          .test(
            "required-check",
            `${field.name} is required`,
            function (value) {
              // Check required first
              if (field.required) {
                if (value === "" || value == null || value === undefined) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return (this as any).createError({
                    message: `${field.name} is required`,
                  });
                }
              } else {
                // Optional field - allow empty
                if (value === "" || value == null || value === undefined) {
                  return true;
                }
              }
              return true;
            }
          )
          .test(
            "is-number",
            `${field.name} must be a number`,
            function (value) {
              // Skip number check if empty and optional
              if (
                !field.required &&
                (value === "" || value == null || value === undefined)
              ) {
                return true;
              }
              const num = Number(value);
              if (isNaN(num)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (this as any).createError({
                  message: `${field.name} must be a number`,
                });
              }
              return true;
            }
          )
          .transform((_value, originalValue) => {
            // Return as string for now, validation will handle conversion
            if (originalValue === "" || originalValue == null) {
              return field.required ? "" : undefined;
            }
            return originalValue;
          });

        // Apply number validations using separate tests
        if (field.min !== undefined) {
          fieldSchema = fieldSchema.test(
            "min-value",
            `${field.name} must be at least ${field.min}`,
            (value: any) => {
              if (
                !field.required &&
                (value === "" || value == null || value === undefined)
              ) {
                return true;
              }
              const num = Number(value);
              return isNaN(num) || num >= field.min!;
            }
          );
        }

        if (field.max !== undefined) {
          fieldSchema = fieldSchema.test(
            "max-value",
            `${field.name} must be at most ${field.max}`,
            (value: any) => {
              if (
                !field.required &&
                (value === "" || value == null || value === undefined)
              ) {
                return true;
              }
              const num = Number(value);
              return isNaN(num) || num <= field.max!;
            }
          );
        }

        // Apply positive validation for price
        if (field.name.toLowerCase().includes("price")) {
          fieldSchema = fieldSchema.test(
            "positive-value",
            `${field.name} must be a positive number`,
            (value: any) => {
              if (
                !field.required &&
                (value === "" || value == null || value === undefined)
              ) {
                return true;
              }
              const num = Number(value);
              return isNaN(num) || num > 0;
            }
          );
        }

        if (!field.required) {
          fieldSchema = fieldSchema.nullable();
        }

        schema[`field_${field.id}`] = fieldSchema;
      } else {
        // Handle string fields (TEXT, LIST, RADIO)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fieldSchema: any = yup.string();

        if (field.required) {
          fieldSchema = fieldSchema
            .required(`${field.name} is required`)
            .test("not-empty", `${field.name} is required`, (value: any) => {
              // For LIST and RADIO, check if value is empty string or undefined
              if (field.fieldType === "LIST" || field.fieldType === "RADIO") {
                return value !== undefined && value !== null && value !== "";
              }
              // For TEXT fields, also check for whitespace
              return (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
              );
            });
        } else {
          fieldSchema = fieldSchema.nullable();
        }

        if (field.minLength !== undefined) {
          fieldSchema = fieldSchema.test(
            "minLength",
            `${field.name} must be at least ${field.minLength} characters`,
            function (value: any) {
              if (!field.required && (!value || String(value).trim() === "")) {
                return true; // Skip validation for empty optional fields
              }
              return value && String(value).length >= field.minLength!;
            }
          );
        }

        if (field.maxLength !== undefined) {
          fieldSchema = fieldSchema.max(
            field.maxLength,
            `${field.name} must be at most ${field.maxLength} characters`
          );
        }

        if (
          field.fieldType === "TEXT" &&
          (field.inputType === "email" ||
            field.name.toLowerCase().includes("email"))
        ) {
          fieldSchema = fieldSchema.email("Please enter a valid email address");
        }

        schema[`field_${field.id}`] = fieldSchema;
      }
    });

    return yup.object().shape(schema);
  };

  const validationSchema = buildValidationSchema();

  // Build default values from config
  const defaultValues = config.data.reduce((acc, field) => {
    acc[`field_${field.id}`] = field.defaultValue || "";
    return acc;
  }, {} as Record<string, string>);

  // Load saved form data from localStorage (if autoSave is enabled)
  const savedData = autoSave ? getFormData(storageKey) : {};
  // Priority: initialValues prop > savedData > defaultValues
  const formInitialValues = initialValues
    ? { ...defaultValues, ...initialValues }
    : { ...defaultValues, ...savedData };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: formInitialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Reset form when initialValues change (for editing scenarios)
  useEffect(() => {
    if (initialValues) {
      const updatedValues = { ...defaultValues, ...initialValues };
      reset(updatedValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  // Watch all form values and save to localStorage on change (if autoSave is enabled)
  useEffect(() => {
    if (!autoSave) return;

    // Use watch with no arguments to get all values, then subscribe to changes
    const subscription = watch((value) => {
      if (value) {
        saveFormData(value as Record<string, string>, storageKey);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, storageKey]);

  const onSubmitForm = (data: Record<string, string | undefined>) => {
    // Transform data back to a more readable format
    const transformedData = config.data.reduce((acc, field) => {
      const fieldKey = `field_${field.id}`;
      acc[field.name] = data[fieldKey] || "";
      return acc;
    }, {} as Record<string, string>);

    if (onSubmit) {
      // Transform to match the expected signature (all values are strings after transformation)
      onSubmit(transformedData as Record<string, string | undefined>);
    } else {
      console.log("Form submitted:", transformedData);
      alert("Form submitted successfully! Check console for data.");
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = `field_${field.id}`;
    const error = errors[fieldName];

    switch (field.fieldType) {
      case "TEXT":
        return (
          <Controller
            key={field.id}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                label={field.name}
                type={field.inputType || "text"}
                fullWidth
                required={field.required}
                error={!!error}
                helperText={error?.message as string}
                FormHelperTextProps={{
                  sx: {
                    color: error ? "error.main" : undefined,
                    marginLeft: 0,
                  },
                }}
                inputProps={
                  {
                    // Remove HTML5 validation attributes to prevent native browser validation
                    // Validation is handled by react-hook-form and yup
                  }
                }
              />
            )}
          />
        );

      case "LIST":
        return (
          <Controller
            key={field.id}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <FormControl fullWidth required={field.required} error={!!error}>
                <InputLabel>{field.name}</InputLabel>
                <Select
                  {...controllerField}
                  label={field.name}
                  error={!!error}
                  value={controllerField.value || ""}
                >
                  {!field.required && (
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                  )}
                  {field.listOfValues1?.map((option, index) => (
                    <MenuItem key={index} value={String(index + 1)}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.75 }}
                  >
                    {error.message as string}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      case "RADIO":
        return (
          <Controller
            key={field.id}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <FormControl
                component="fieldset"
                required={field.required}
                error={!!error}
                fullWidth
              >
                <FormLabel component="legend">{field.name}</FormLabel>
                <RadioGroup {...controllerField} row>
                  {field.listOfValues1?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={String(index + 1)}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
                {error && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {error.message as string}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
      {title && (
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitForm)}
        noValidate
        sx={{ mt: 3 }}
      >
        {config.data.map((field) => (
          <Box key={field.id} sx={{ mb: 3 }}>
            {renderField(field)}
          </Box>
        ))}

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth={!showResetButton}
            sx={showResetButton ? {} : {}}
          >
            {submitButtonText}
          </Button>
          {showResetButton && (
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => reset(defaultValues)}
            >
              Reset
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
