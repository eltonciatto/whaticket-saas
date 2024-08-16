import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  messageList: {
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
  inputArea: {
    padding: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  boxLeft: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    maxWidth: "60%",
    borderRadius: 10,
    borderBottomLeftRadius: 0,
  },
  boxRight: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    marginLeft: "auto",
    backgroundColor: theme.palette.primary.light,
    maxWidth: "60%",
    borderRadius: 10,
    borderBottomRightRadius: 0,
    textAlign: "right",
  },
  senderName: {
    fontWeight: "bold",
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const messageEndRef = useRef();

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (chat) {
      if (unreadMessages(chat) > 0) {
        markAsRead(chat);
      }
      scrollToBottomRef.current = scrollToBottom;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  const unreadMessages = (chat) => {
    const currentUser = chat?.users?.find((u) => u.userId === user.id);
    return currentUser?.unreads || 0;
  };

  const markAsRead = async (chat) => {
    try {
      await api.post(`/chats/${chat.id}/read`, { userId: user.id });
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
  };

  const handleScroll = (e) => {
    if (!pageInfo.hasMore || loading) return;
    if (e.currentTarget.scrollTop < 600) {
      handleLoadMore();
    }
  };

  const handleSendMessageClick = () => {
    if (contentMessage.trim()) {
      handleSendMessage(contentMessage);
      setContentMessage("");
    }
  };

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => (
            <Box
              key={key}
              className={
                item.senderId === user.id ? classes.boxRight : classes.boxLeft
              }
            >
              <Typography variant="subtitle2" className={classes.senderName}>
                {item.sender.name}
              </Typography>
              <Typography variant="body2">{item.message}</Typography>
              <Typography variant="caption" display="block">
                {datetimeToClient(item.createdAt)}
              </Typography>
            </Box>
          ))}
        <div ref={messageEndRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && !e.shiftKey && contentMessage.trim()) {
                handleSendMessageClick();
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleSendMessageClick}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
    </Paper>
  );
}
