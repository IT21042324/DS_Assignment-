import { useEffect, useState } from "react";
import { useBackendAPI } from "../context/useBackendAPI";
import { UseUserContext } from "../context/useUserContext";
import { fetchUserContacts } from "../utils/googleApi";
import ContactList from "./ContactList";

export const ContactListHandler = ({ item, handleClose }) => {
  const [contactList, setContactList] = useState([]);
  const { user1 } = UseUserContext();
  const { fetchAccessToken } = useBackendAPI();

  const [fetchingContactStatus, setFetchingContactStatus] = useState(
    "Fetching contacts..."
  );

  useEffect(() => {
    const getContacts = async () => {
      try {
        const access_token = await fetchAccessToken(user1[0].userName);

        if (access_token) {
          const res = await fetchUserContacts(access_token);

          if (res.data.connections) {
            // Filter for valid connections and map to their email values
            const filteredContactsList = res.data.connections
              .filter((conn) => conn?.emailAddresses?.[0]?.value) // Keep only valid entries
              .map((conn) => conn.emailAddresses[0].value); // Extract the email address

            setContactList(filteredContactsList);
          } else {
            setContactList([]);
            setFetchingContactStatus("No contacts found!");
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    getContacts(); // Call the async function
  }, [user1]); // Dependency array

  return (
    <ContactList
      contactList={contactList}
      fetchingContactsUpdateStatus={fetchingContactStatus}
      item={item}
      handleClose={handleClose} // Pass handleClose to ContactList
    />
  );
};
