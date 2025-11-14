export type FieldType = "TEXT" | "LIST" | "RADIO";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url";

export interface FormField {
  id: number;
  name: string;
  fieldType: FieldType;
  minLength?: number;
  maxLength?: number;
  min?: number; // For number fields: minimum value
  max?: number; // For number fields: maximum value
  defaultValue?: string;
  required?: boolean;
  listOfValues1?: string[];
  inputType?: InputType; // For TEXT fields: "text" | "email" | "password" | etc.
}

export interface FormConfig {
  data: FormField[];
}
