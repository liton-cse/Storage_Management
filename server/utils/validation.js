export const validateSignup = (data) => {
  if (!data.name || !data.email || !data.password || !data.confirmPassword) {
    throw new Error("All fields are required");
  }
  if (data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }
};

export const validateLogin = (data) => {
  if (!data.email || !data.password) {
    throw new Error("Email and password are required");
  }
};

export const validateResetPassword = (data) => {
  if (!data.password || !data.confirmPassword) {
    throw new Error("All fields are required");
  }
  if (data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }
};
