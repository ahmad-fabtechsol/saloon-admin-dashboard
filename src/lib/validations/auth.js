import * as yup from "yup"

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})

export const profileSchema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .min(7, "Enter a valid phone number")
    .required("Phone is required"),
})

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
})

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
})
