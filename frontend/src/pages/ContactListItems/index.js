import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
  useCallback,
} from "react";

import { toast } from "react-toastify";
import { useParams, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from "@material-ui/icons";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListItemModal from "../../components/ContactListItemModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import useContactLists from "../../hooks/useContactLists";
import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CONTACTS":
      const newContacts = action.payload.filter(
        (contact) => !state.some((c) => c.id === contact.id)
      );
      return [...state, ...newContacts];
    case "UPDATE_CONTACTS":
      return state.map((contact) =>
        contact.id === action.payload.id ? action.payload : contact
      );
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

const ContactListItems = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { contactListId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactListItemModalOpen, setContactListItemModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [contactList, setContactList] = useState({});
  const fileUploadRef = useRef(null);

  const { findById: findContactList } = useContactLists();
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    findContactList(contactListId).then(setContactList);
  }, [contactListId, findContactList]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`contact-list-items`, {
          params: { searchParam, pageNumber, contactListId },
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
  }, [searchParam, pageNumber, contactListId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleSocketData = (data) => {
      switch (data.action) {
        case "update":
        case "create":
          dispatch({ type: "UPDATE_CONTACTS", payload: data.record });
          break;
        case "delete":
          dispatch({ type: "DELETE_CONTACT", payload: +data.id });
          break;
        case "reload":
          dispatch({ type: "LOAD_CONTACTS", payload: data.records });
          break;
        default:
          break;
      }
    };

    socket.on(`company-${companyId}-ContactListItem`, handleSocketData);
    socket.on(
      `company-${companyId}-ContactListItem-${contactListId}`,
      handleSocketData
    );

    return () => socket.disconnect();
  }, [contactListId, socketManager]);

  const handleSearch = (event) => setSearchParam(event.target.value.toLowerCase());

  const handleOpenContactListItemModal = useCallback(() => {
    setSelectedContactId(null);
    setContactListItemModalOpen(true);
  }, []);

  const handleCloseContactListItemModal = useCallback(() => {
    setSelectedContactId(null);
    setContactListItemModalOpen(false);
  }, []);

  const handleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactListItemModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contact-list-items/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    } finally {
      setDeletingContact(null);
      setSearchParam("");
      setPageNumber(1);
    }
  };

  const handleImportContacts = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.post(`contact-lists/${contactListId}/upload`, formData);
      toast.success("Contatos importados com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => setPageNumber((prev) => prev + 1);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const goToContactLists = () => history.push("/contact-lists");

  return (
    <MainContainer className={classes.mainContainer}>
      <ContactListItemModal
        open={contactListItemModalOpen}
        onClose={handleCloseContactListItemModal}
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contactListItems.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleImportContacts()
        }
      >
        {deletingContact
          ? i18n.t("contactListItems.confirmationModal.deleteMessage")
          : `${i18n.t("contactListItems.confirmationModal.importMessage")} `}
        <a href={planilhaExemplo} download="planilha.xlsx">
          {i18n.t("contactListItems.confirmationModal.downloadExample")}
        </a>
      </ConfirmationModal>
      <MainHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <Title>{contactList.name}</Title>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  placeholder={i18n.t("contactListItems.searchPlaceholder")}
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
              </Grid>
              <Grid item xs={4} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={goToContactLists}
                >
                  {i18n.t("contactListItems.buttons.lists")}
                </Button>
              </Grid>
              <Grid item xs={4} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    fileUploadRef.current.value = null;
                    fileUploadRef.current.click();
                  }}
                >
                  {i18n.t("contactListItems.buttons.import")}
                </Button>
              </Grid>
              <Grid item xs={4} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleOpenContactListItemModal}
                >
                  {i18n.t("contactListItems.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <input
          style={{ display: "none" }}
          type="file"
          accept=".xls,.xlsx"
          ref={fileUploadRef}
          onChange={() => setConfirmOpen(true)}
        />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell>{i18n.t("contactListItems.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("contactListItems.table.number")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contactListItems.table.email")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contactListItems.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell align="center">
                  <IconButton>
                    {contact.isWhatsappValid ? (
                      <CheckCircleIcon titleAccess="Whatsapp Válido" htmlColor="green" />
                    ) : (
                      <BlockIcon titleAccess="Whatsapp Inválido" htmlColor="grey" />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell align="center">{contact.number}</TableCell>
                <TableCell align="center">{contact.email}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEditContact(contact.id)}>
                    <EditIcon />
                  </IconButton>
                  <Can
                    role={user.profile}
                    perform="contacts-page:deleteContact"
                    yes={() => (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setConfirmOpen(true);
                          setDeletingContact(contact);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={4} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactListItems;
