import { ContactListHandler } from "./ContactListHandler";
import PopupModel from "./PopupModel";

export const ContactListPopupModel = ({ item }) => {
  return (
    <PopupModel
      ModelDisplayContent={<ContactListHandler item={item} />}
      popUpButtonName="Make Referral"
    />
  );
};
