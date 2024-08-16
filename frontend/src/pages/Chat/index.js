import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
} from "@material-ui/core";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { has, isObject } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    padding: theme.spacing(2),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  gridContainer: {
    flex: 1,
    height: "100%",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: theme.palette.background.paper,
  },
  gridItem: {
    height: "100%",
  },
  gridItemTab: {
    height: "92%",
    width: "100%",
  },
  btnContainer: {
    textAlign: "right",
    padding: 10,
  },
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
}) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit") {
      const userList = chat.users.map((u) => ({
        id: u.user.id,
        name: u.user.name,
      }));
      setUsers(userList);
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (!title) {
        alert("Por favor, preencha o título da conversa.");
        return;
      }

      if (!users || users.length === 0) {
        alert("Por favor, selecione pelo menos um usuário.");
        return;
      }

      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, { users, title });
      } else {
        const { data } = await api.post("/chats", { users, title });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Conversa</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} style={{ padding: 18 }}>
            <TextField
              label="Título"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
  }, [currentChat]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat-user-${user.id}`, (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        const updatedChats = chats.map((chat) =>
          chat.id === data.record.id ? { ...data.record } : chat
        );
        setChats(updatedChats);
        if (currentChat.id === data.record.id) setCurrentChat(data.record);
      }
    });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "delete") {
        const filteredChats = chats.filter((c) => c.id !== +data.id);
        setChats(filteredChats);
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    });

    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, (data) => {
        if (data.action === "new-message") {
          setMessages((prev) => [...prev, data.newMessage]);
          const updatedChats = chats.map((chat) =>
            chat.id === data.newMessage.chatId ? { ...data.chat } : chat
          );
          setChats(updatedChats);
          scrollToBottomRef.current();
        }

        if (data.action === "update") {
          const updatedChats = chats.map((chat) =>
            chat.id === data.chat.id ? { ...data.chat } : chat
          );
          setChats(updatedChats);
          scrollToBottomRef.current();
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [currentChat, socketManager, user.id]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (contentMessage) => {
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chats/${chatId}/messages?pageNumber=${messagesPage}`);
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) findMessages(currentChat.id);
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  const renderGrid = () => (
    <Grid className={classes.gridContainer} container>
      <Grid className={classes.gridItem} md={3} item>
        <div className={classes.btnContainer}>
          <Button
            onClick={() => {
              setDialogType("new");
              setShowDialog(true);
            }}
            color="primary"
            variant="contained"
          >
            Nova
          </Button>
        </div>
        <ChatList
          chats={chats}
          pageInfo={chatsPageInfo}
          loading={loading}
          handleSelectChat={selectChat}
          handleDeleteChat={deleteChat}
          handleEditChat={() => {
            setDialogType("edit");
            setShowDialog(true);
          }}
        />
      </Grid>
      <Grid className={classes.gridItem} md={9} item>
        {isObject(currentChat) && has(currentChat, "id") && (
          <ChatMessages
            chat={currentChat}
            scrollToBottomRef={scrollToBottomRef}
            pageInfo={messagesPageInfo}
            messages={messages}
            loading={loading}
            handleSendMessage={sendMessage}
            handleLoadMore={loadMoreMessages}
          />
        )}
      </Grid>
    </Grid>
  );

  const renderTab = () => (
    <Grid className={classes.gridContainer} container>
      <Grid md={12} item>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(e, v) => setTab(v)}
        >
          <Tab label="Chats" />
          <Tab label="Mensagens" />
        </Tabs>
      </Grid>
      {tab === 0 && (
        <Grid className={classes.gridItemTab} md={12} item>
          <div className={classes.btnContainer}>
            <Button
              onClick={() => setShowDialog(true)}
              color="primary"
              variant="contained"
            >
              Novo
            </Button>
          </div>
          <ChatList
            chats={chats}
            pageInfo={chatsPageInfo}
            loading={loading}
            handleSelectChat={selectChat}
            handleDeleteChat={deleteChat}
          />
        </Grid>
      )}
      {tab === 1 && (
        <Grid className={classes.gridItemTab} md={12} item>
          {isObject(currentChat) && has(currentChat, "id") && (
            <ChatMessages
              scrollToBottomRef={scrollToBottomRef}
              pageInfo={messagesPageInfo}
              messages={messages}
              loading={loading}
              handleSendMessage={sendMessage}
              handleLoadMore={loadMoreMessages}
            />
          )}
        </Grid>
      )}
    </Grid>
  );

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          setTab(1);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
      />
      <Paper className={classes.mainContainer}>
        {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
      </Paper>
    </>
  );
}

export default withWidth()(Chat);
