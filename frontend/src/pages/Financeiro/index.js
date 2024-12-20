import React, { useState, useEffect, useReducer, useCallback } from "react";
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
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Grid from "@material-ui/core/Grid"; // Adicionado para responsividade

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

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
    padding: theme.spacing(2), // Ajuste de padding para melhor visualização
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  tableCell: {
    padding: theme.spacing(1),
    fontSize: "0.875rem", // Ajuste de fonte para telas pequenas
  },
  searchField: {
    width: "100%", // Garante que o campo de busca ocupe a largura total em telas menores
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
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

  const fetchInvoices = useCallback(async () => {
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
  }, [searchParam, pageNumber]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    fetchInvoices();
  }, [searchParam, pageNumber, fetchInvoices]);

  const handleOpenSubscriptionModal = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setSubscriptionModalOpen(true);
  }, []);

  const handleCloseSubscriptionModal = useCallback(() => {
    setSelectedInvoice(null);
    setSubscriptionModalOpen(false);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore) setPageNumber((prev) => prev + 1);
  }, [hasMore]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
      loadMore();
    }
  };

  const rowStyle = (invoice) => {
    const today = new Date();
    const dueDate = parseISO(invoice.dueDate);
    const daysRemaining = differenceInDays(dueDate, today);

    if (daysRemaining < 0 && invoice.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (invoice) => {
    const today = new Date();
    const dueDate = parseISO(invoice.dueDate);
    const daysRemaining = differenceInDays(dueDate, today);

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
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Pesquisar..."
            type="search"
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" className={classes.tableCell}>Id</TableCell>
                  <TableCell align="center" className={classes.tableCell}>Detalhes</TableCell>
                  <TableCell align="center" className={classes.tableCell}>Valor</TableCell>
                  <TableCell align="center" className={classes.tableCell}>Data Venc.</TableCell>
                  <TableCell align="center" className={classes.tableCell}>Status</TableCell>
                  <TableCell align="center" className={classes.tableCell}>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} style={rowStyle(invoice)}>
                    <TableCell align="center" className={classes.tableCell}>{invoice.id}</TableCell>
                    <TableCell align="center" className={classes.tableCell}>{invoice.detail}</TableCell>
                    <TableCell align="center" className={classes.tableCell} style={{ fontWeight: "bold" }}>
                      {invoice.value.toLocaleString("pt-br", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell align="center" className={classes.tableCell}>
                      {format(parseISO(invoice.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell align="center" className={classes.tableCell} style={{ fontWeight: "bold" }}>
                      {rowStatus(invoice)}
                    </TableCell>
                    <TableCell align="center" className={classes.tableCell}>
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
          </Grid>
        </Grid>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
