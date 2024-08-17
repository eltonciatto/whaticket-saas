import React, { useState, useEffect, useReducer, useContext, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Tooltip, Avatar, Button, IconButton, Paper, TextField, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Search as SearchIcon, DeleteOutline as DeleteOutlineIcon, Edit as EditIcon, WhatsApp as WhatsAppIcon } from "@material-ui/icons";
import { CSVLink } from "react-csv";
import Cookies from "js-cookie";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";
import NewTicketModal from "../../components/NewTicketModal";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CONTACTS":
      return [...state, ...action.payload];
    case "UPDATE_CONTACTS":
      return state.map((contact) => contact.id === action.payload.id ? action.payload : contact);
    case "DELETE_CONTACT":
      return state.filter((contact) => contact.id !== action.payload);
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

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const fileUploadRef = useRef(null);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchContacts = async () => {
      try {
        const { data } = await api.get("/contacts/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchContacts, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = Cookies.get("companyId"); // Usando js-cookie para pegar o companyId
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      switch (data.action) {
        case "update":
        case "create":
          dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
          break;
        case "delete":
          dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
          break;
        default:
          break;
      }
    });

    return () => socket.disconnect();
  }, [socketManager]);

  const handleSearch = useCallback((event) => setSearchParam(event.target.value.toLowerCase()), []);

  const handleOpenContactModal = useCallback(() => setContactModalOpen(true), []);
  const handleCloseContactModal = useCallback(() => setContactModalOpen(false), []);

  const handleEditContact = useCallback((contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  }, []);

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleImportContact = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.post("/contacts/upload", formData);
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = useCallback(() => setPageNumber((prev) => prev + 1), []);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => ticket && ticket.uuid && history.push(`/tickets/${ticket.uuid}`)}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={deletingContact ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?` : i18n.t("contacts.confirmationModal.importTitlte")}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deletingContact ? handleDeleteContact(deletingContact.id) : handleImportContact()}
      >
        {deletingContact
          ? i18n.t("contacts.confirmationModal.deleteMessage")
          : i18n.t("contacts.confirmationModal.importMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("contacts.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
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
          <Button variant="contained" color="primary" onClick={() => setConfirmOpen(true)}>
            {i18n.t("contacts.buttons.import")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              fileUploadRef.current.value = null;
              fileUploadRef.current.click();
            }}
          >
            {i18n.t("contacts.buttons.importSheet")}
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpenContactModal}>
            {i18n.t("contacts.buttons.add")}
          </Button>
          <CSVLink style={{ textDecoration: 'none' }} separator=";" filename="contacts.csv" data={contacts.map((contact) => ({ name: contact.name, number: contact.number, email: contact.email }))}>
            <Button variant="contained" color="primary">EXPORTAR CONTATOS</Button>
          </CSVLink>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <input
          style={{ display: "none" }}
          ref={fileUploadRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={() => setConfirmOpen(true)}
        />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("contacts.table.whatsapp")}</TableCell>
              <TableCell align="center">{i18n.t("contacts.table.email")}</TableCell>
              <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell style={{ paddingRight: 0 }}>
                  <Avatar src={contact.profilePicUrl} />
                </TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell align="center">{contact.number}</TableCell>
                <TableCell align="center">{contact.email}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => { setContactTicket(contact); setNewTicketModalOpen(true); }}>
                    <WhatsAppIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEditContact(contact.id)}>
                    <EditIcon />
                  </IconButton>
                  <Can role={user.profile} perform="contacts-page:deleteContact">
                    <IconButton size="small" onClick={() => { setConfirmOpen(true); setDeletingContact(contact); }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Can>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton avatar columns={3} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Contacts;
