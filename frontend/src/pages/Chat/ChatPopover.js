import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import Popover from "@material-ui/core/Popover";
import ForumIcon from "@material-ui/icons/Forum";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import { SocketContext } from "../../context/Socket/SocketContext";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";
import notifySound from "../../assets/chat_notify.mp3";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 300,
    maxWidth: 500,
    padding: theme.spacing(1),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      return [...state, ...action.payload];
    case "UPDATE_CHATS":
      const updatedChatIndex = state.findIndex((chat) => chat.id === action.payload.id);
      if (updatedChatIndex !== -1) {
        state[updatedChatIndex] = action.payload;
        return [...state];
      } else {
        return [action.payload, ...state];
      }
    case "DELETE_CHAT":
      return state.filter((chat) => chat.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

export default function ChatPopover() {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const { datetimeToClient } = useDate();

  const [chats, dispatch] = useReducer(reducer, []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [invisible, setInvisible] = useState(true);
  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();

  useEffect(() => {
    soundAlertRef.current = play;
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    if (!socket) return;

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message" && data.newMessage.senderId !== user.id) {
        dispatch({ type: "UPDATE_CHATS", payload: data.newMessage.chat });
        soundAlertRef.current();
      }
      if (data.action === "update") {
        dispatch({ type: "UPDATE_CHATS", payload: data.chat });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user.id]);

  useEffect(() => {
    const unreads = chats.reduce((count, chat) => {
      const chatUser = chat.users.find((u) => u.userId === user.id);
      return count + (chatUser?.unreads || 0);
    }, 0);
    setInvisible(unreads === 0);
  }, [chats, user.id]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/");
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToMessages = (chat) => {
    window.location.href = `/chats/${chat.uuid}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        variant="contained"
        color="inherit"
        onClick={handleClick}
        style={{ color: "white" }}
      >
        <Badge color="secondary" variant="dot" invisible={invisible}>
          <ForumIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Paper
          variant="outlined"
          className={classes.mainPaper}
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            if (scrollHeight - (scrollTop + clientHeight) < 100) {
              fetchChats();
            }
          }}
        >
          <List component="nav" style={{ minWidth: 300 }}>
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                style={{ backgroundColor: chat.unread ? "#f0f0f0" : "white", cursor: "pointer" }}
                onClick={() => goToMessages(chat)}
                button
              >
                <ListItemText
                  primary={chat.lastMessage}
                  secondary={
                    <Typography component="span" style={{ fontSize: 12 }}>
                      {datetimeToClient(chat.updatedAt)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            {!chats.length && (
              <ListItemText primary={i18n.t("mainDrawer.appBar.notRegister")} />
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
