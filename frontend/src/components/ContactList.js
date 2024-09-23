import List from "@mui/material/List";
import { useState } from "react";
import { IoIosSend } from "react-icons/io";
import ContactListItem from "./ContactListItem"; // Import the new component
import styles from "./ContactList.module.css";
import { SendReferralMail } from "../utils/sendReferralMail";
import { UseUserContext } from "../context/useUserContext";

export default function ContactList({
  contactList,
  fetchingContactsUpdateStatus,
  item,
  handleClose,
}) {
  const [receipientList, setReceipientList] = useState([]);
  const { user1 } = UseUserContext();

  const handleToggle = (value) => () => {
    setReceipientList((list) =>
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  const handleSendMail = async () => {
    // Implement send mail logic
    const result_test = await SendReferralMail({
      to_email: receipientList.join(", "),
      sender_email: user1[0].userName,
      store_name: item.storeName,
      product_name: item.productName,
      product_image_url: item.image,
    });

    if (result_test.toLowerCase() === "ok") {
      alert("Mail sent successfully");
      handleClose(); // Close the modal after sending mail
    } else {
      alert(result_test);
    }
  };

  return (
    <List
      dense
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 500,
        bgcolor: "background.paper",
        p: 0,
        m: 0,
        gap: 1,
      }}
    >
      {contactList?.length ? (
        <>
          <div className={styles.selectContactsTitleContainer}>
            Select Contacts
            {receipientList.length > 0 && (
              <div className={styles.sendMailIconContainer}>
                <IoIosSend
                  title="Send Mail"
                  size={24}
                  onClick={handleSendMail}
                />
              </div>
            )}
          </div>
          {contactList.map((value) => (
            <ContactListItem
              key={value}
              value={value}
              checked={receipientList}
              handleToggle={handleToggle}
            />
          ))}
        </>
      ) : (
        <p>{fetchingContactsUpdateStatus}</p>
      )}
    </List>
  );
}
