import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import moment from "moment";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TableRowSkeleton from "../../components/TableRowSkeleton";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_INVOICES":
      const newInvoices = action.payload.filter(
        (invoice) => !state.some((s) => s.id === invoice.id)
      );
      return [...state, ...newInvoices];
    case "UPDATE_INVOICE":
      return state.map((invoice) =>
        invoice.id === action.payload.id ? action.payload : invoice
      );
    case "DELETE_INVOICE":
      return state.filter((invoice) => invoice.id !== action.payload);
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
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
}));

const Invoices = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/invoices/all", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_INVOICES", payload: data });
      setHasMore(data.hasMore);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    fetchInvoices();
  }, [searchParam, pageNumber]);

  const handleOpenSubscriptionModal = (invoice) => {
    setSelectedInvoice(invoice);
    setSubscriptionModalOpen(true);
  };

  const handleCloseSubscriptionModal = () => {
    setSelectedInvoice(null);
    setSubscriptionModalOpen(false);
  };

  const loadMore = () => {
    if (hasMore) setPageNumber((prev) => prev + 1);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
      loadMore();
    }
  };

  const rowStyle = (invoice) => {
    const today = moment().format("DD/MM/yyyy");
    const dueDate = moment(invoice.dueDate).format("DD/MM/yyyy");
    const diff = moment(dueDate, "DD/MM/yyyy").diff(moment(today, "DD/MM/yyyy"));
    const daysRemaining = moment.duration(diff).asDays();

    if (daysRemaining < 0 && invoice.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (invoice) => {
    const today = moment().format("DD/MM/yyyy");
    const dueDate = moment(invoice.dueDate).format("DD/MM/yyyy");
    const diff = moment(dueDate, "DD/MM/yyyy").diff(moment(today, "DD/MM/yyyy"));
    const daysRemaining = moment.duration(diff).asDays();

    if (invoice.status === "paid") return "Pago";
    return daysRemaining < 0 ? "Vencido" : "Em Aberto";
  };

  return (
    <MainContainer>
      <SubscriptionModal
        open={subscriptionModalOpen}
        onClose={handleCloseSubscriptionModal}
        invoice={selectedInvoice}
      />
      <MainHeader>
        <Title>Faturas</Title>
        <TextField
          placeholder="Pesquisar..."
          type="search"
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "gray" }} />
              </InputAdornment>
            ),
          }}
        />
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Id</TableCell>
              <TableCell align="center">Detalhes</TableCell>
              <TableCell align="center">Valor</TableCell>
              <TableCell align="center">Data Venc.</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} style={rowStyle(invoice)}>
                <TableCell align="center">{invoice.id}</TableCell>
                <TableCell align="center">{invoice.detail}</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold" }}>
                  {invoice.value.toLocaleString("pt-br", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell align="center">
                  {moment(invoice.dueDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="center" style={{ fontWeight: "bold" }}>
                  {rowStatus(invoice)}
                </TableCell>
                <TableCell align="center">
                  {rowStatus(invoice) !== "Pago" ? (
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleOpenSubscriptionModal(invoice)}
                    >
                      PAGAR
                    </Button>
                  ) : (
                    <Button size="small" variant="outlined" disabled>
                      PAGO
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={6} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
