import DOMPurify from "dompurify"; // For sanitization

// Encodes input to prevent XSS
export const encodeInput = (input) => {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
};

// Sanitize and encode inputs to prevent XSS
export const sanitizeAndEncodeInputs = (inputs) => {
  const sanitizedInputs = {
    userName: DOMPurify.sanitize(inputs.userName),
    password: DOMPurify.sanitize(inputs.password),
    contact: DOMPurify.sanitize(inputs.contact),
    address: DOMPurify.sanitize(inputs.address),
  };

  const encodedInputs = {
    userName: encodeInput(sanitizedInputs.userName),
    password: encodeInput(sanitizedInputs.password),
    contact: encodeInput(sanitizedInputs.contact),
    address: encodeInput(sanitizedInputs.address),
  };

  return encodedInputs;
};

// Form validation logic
export const validateForm = (inputs) => {
  const errors = {};

  if (!inputs.userName.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
    errors.userName = "Invalid email format. Please enter a valid email.";
  }

  if (
    !inputs.password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/
    )
  ) {
    errors.password =
      "Password must be 6-20 characters, include at least one uppercase letter, one number, and one special character.";
  }

  if (!inputs.contact.match(/^\d{10}$/)) {
    errors.contact = "Contact number must be exactly 10 digits.";
  }

  const addressValue = inputs.address.trim();
  if (addressValue.length < 10) {
    errors.address = "Address must be at least 10 characters long.";
  } else if (!/\d/.test(addressValue) || !/[a-zA-Z]/.test(addressValue)) {
    errors.address = "Address must contain both letters and numbers.";
  } else if (/[^a-zA-Z0-9\s,-]/.test(addressValue)) {
    errors.address = "Address contains invalid special characters.";
  }

  return errors;
};
