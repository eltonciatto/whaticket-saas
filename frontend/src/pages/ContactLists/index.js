import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import {
  makeStyles,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Grid
} from "@material-ui/core";
import {
  Search as SearchIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  GetApp as DownloadIcon
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CONTACTLISTS":
      const newContactLists = action.payload.filter(
        (contactList) => !state.some((cl) => cl.id === contactList.id)
      );
      return [...state, ...newContactLists];
    case "UPDATE_CONTACTLIST":
      return state.map((contactList) =>
        contactList.id === action.payload.id ? action.payload : contactList
      );
    case "DELETE_CONTACTLIST":
      return state.filter((contactList) => contactList.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    const fetchContactLists = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/contact-lists/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchContactLists, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleSocketData = (data) => {
      switch (data.action) {
        case "update":
        case "create":
          dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
          break;
        case "delete":
          dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
          break;
        default:
          break;
      }
    };

    socket.on(`company-${companyId}-ContactList`, handleSocketData);

    return () => socket.disconnect();
  }, [socketManager]);

  const handleSearch = (event) => setSearchParam(event.target.value.toLowerCase());

  const handleOpenContactListModal = useCallback(() => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  }, []);

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    } finally {
      setDeletingContactList(null);
      setSearchParam("");
      setPageNumber(1);
    }
  };

  const loadMore = () => setPageNumber((prev) => prev + 1);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const goToContacts = (id) => history.push(`/contact-lists/${id}/contacts`);

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${
            deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        contactListId={selectedContactList?.id}
      />
      <MainHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Title>{i18n.t("contactLists.title")}</Title>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={2}>
              <Grid item xs={7} sm={6}>
                <TextField
                  fullWidth
                  placeholder={i18n.t("contacts.searchPlaceholder")}
                  value={searchParam}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={5} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleOpenContactListModal}
                >
                  {i18n.t("contactLists.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("contactLists.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("contactLists.table.contacts")}</TableCell>
              <TableCell align="center">{i18n.t("contactLists.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contactLists.map((contactList) => (
              <TableRow key={contactList.id}>
                <TableCell align="center">{contactList.name}</TableCell>
                <TableCell align="center">{contactList.contactsCount || 0}</TableCell>
                <TableCell align="center">
                  <a href={planilhaExemplo} download="planilha.xlsx">
                    <IconButton size="small" title="Baixar Planilha Exemplo">
                      <DownloadIcon />
                    </IconButton>
                  </a>
                  <IconButton size="small" onClick={() => goToContacts(contactList.id)}>
                    <PeopleIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEditContactList(contactList)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setConfirmModalOpen(true);
                      setDeletingContactList(contactList);
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={3} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactLists;
