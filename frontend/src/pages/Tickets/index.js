import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import logo from "../../assets/logo.png";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    padding: theme.spacing(4),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  chatPapper: {
    display: "flex",
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
  },
  messagessWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
  },
  welcomeMsg: {
    backgroundColor: theme.palette.boxticket,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "100%",
    textAlign: "center",
    padding: theme.spacing(2),
  },
  logo: {
    width: "70%",
    maxWidth: 300,
    marginBottom: theme.spacing(2),
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={4} className={classes.contactsWrapper}>
            <TicketsManager />
          </Grid>
          <Grid item xs={12} sm={8} className={classes.messagessWrapper}>
            {ticketId ? (
              <Ticket />
            ) : (
              <Paper square variant="outlined" className={classes.welcomeMsg}>
                <img className={classes.logo} src={logo} alt="logologin" />
                <Typography variant="h6">{i18n.t("chat.noTicketMessage")}</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
