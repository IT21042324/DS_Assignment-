import * as React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import { getColorForLetter } from "../utils/avatarColorSelector";

export default function ContactListItem({ value, checked, handleToggle }) {
  const labelId = `checkbox-list-secondary-label-${value}`;

  // Get the first letter of the email address
  const avatarLetter = value.charAt(0).toUpperCase();
  const avatarColor = getColorForLetter(avatarLetter);

  return (
    <ListItem
      key={value}
      secondaryAction={
        <Checkbox
          edge="end"
          onChange={handleToggle(value)}
          checked={checked.includes(value)}
          inputProps={{ "aria-labelledby": labelId }}
        />
      }
      style={{ padding: "0" }}
    >
      <ListItemButton>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: avatarColor }}>{avatarLetter}</Avatar>
          {/* Display the first letter of the email and set background color */}
        </ListItemAvatar>
        <ListItemText id={labelId} primary={value} /> {/* Show email address */}
      </ListItemButton>
    </ListItem>
  );
}
