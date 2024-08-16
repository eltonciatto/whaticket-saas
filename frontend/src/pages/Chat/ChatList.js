import React, { useContext, useState } from "react";
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  useTheme, // Import useTheme corretamente
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "calc(100% - 58px)",
    overflow: "hidden",
    backgroundColor: theme.palette.boxlist, // Dark mode custom color
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  listItem: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
}) {
  const theme = useTheme(); // Aqui o useTheme é chamado corretamente dentro do componente
  if (!theme) {
    console.error("Theme not found");
  }

  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {
        console.error("Failed to mark chat as read:", err);
      }
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
    setConfirmModalOpen(false);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser?.unreads || 0;
  };

  const getPrimaryText = (chat) => {
    const unreads = unreadMessages(chat);
    return (
      <>
        {chat.title}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 5 }}
            label={unreads}
            color="secondary"
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    return chat.lastMessage
      ? `${datetimeToClient(chat.updatedAt)}: ${chat.lastMessage}`
      : "";
  };

  const getItemStyle = (chat) => {
    return {
      borderLeft: chat.uuid === id ? "6px solid #012489" : "none",
      backgroundColor: chat.uuid === id ? theme.palette.action.selected : "none",
    };
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <List>
            {chats.map((chat, key) => (
              <ListItem
                key={key}
                onClick={() => goToMessages(chat)}
                className={classes.listItem}
                style={getItemStyle(chat)}
                button
              >
                <ListItemText
                  primary={getPrimaryText(chat)}
                  secondary={getSecondaryText(chat)}
                />
                {chat.ownerId === user.id && (
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => {
                        goToMessages(chat).then(() => handleEditChat(chat));
                      }}
                      edge="end"
                      aria-label="edit"
                      size="small"
                      style={{ marginRight: 5 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedChat(chat);
                        setConfirmModalOpen(true);
                      }}
                      edge="end"
                      aria-label="delete"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </>
  );
}
