import emailjs from "emailjs-com";

// Function to send email using emailjs
export const SendReferralMail = (email) => {
  // Setting the template ID
  const template = "template_vvec7rg";
  const service_id = "service_8gmpuxf";
  const pub_key = "D8zQ6PquDXoTY67LS";

  //adding the site link to the email object
  email.site_link = "https://localhost:3000/";

  // Sending the email using emailjs and returning the result
  return emailjs.send(service_id, template, email, pub_key).then(
    (result) => {
      return result.text;
    },
    (error) => {
      return error.text;
    }
  );
};
