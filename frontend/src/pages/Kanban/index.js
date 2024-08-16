import React, { useState, useEffect, useContext, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  button: {
    background: "#10a110",
    border: "none",
    padding: "10px",
    color: "white",
    fontWeight: "bold",
    borderRadius: "5px",
    cursor: "pointer",
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState({ lanes: [] });
  const [tickets, setTickets] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchTags = useCallback(async () => {
    try {
      const response = await api.get("/tags/kanban");
      setTags(response.data.lista || []);
    } catch (error) {
      toast.error(i18n.t("Erro ao carregar tags"));
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const queueIds = user.queues.map((queue) => queue.UserQueue.queueId);
      const { data } = await api.get("/ticket/kanban", {
        params: { queueIds: JSON.stringify(queueIds), teste: true },
      });
      setTickets(data.tickets);
    } catch (error) {
      toast.error(i18n.t("Erro ao carregar tickets"));
    }
  }, [user.queues]);

  useEffect(() => {
    fetchTags();
    fetchTickets();
  }, [fetchTags, fetchTickets]);

  const popularCards = useCallback(() => {
    const lanes = [
      {
        id: "lane0",
        title: i18n.t("Em aberto"),
        label: tickets.filter((ticket) => ticket.tags.length === 0).length,
        cards: tickets
          .filter((ticket) => ticket.tags.length === 0)
          .map((ticket) => ({
            id: ticket.id.toString(),
            title: ticket.contact.name,
            description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button
                  className={classes.button}
                  onClick={() => handleCardClick(ticket.uuid)}
                >
                  Ver Ticket
                </button>
              </div>
            ),
            draggable: true,
          })),
      },
      ...tags.map((tag) => ({
        id: tag.id.toString(),
        title: tag.name,
        label: tickets.filter((ticket) => ticket.tags.some((t) => t.id === tag.id)).length,
        cards: tickets
          .filter((ticket) => ticket.tags.some((t) => t.id === tag.id))
          .map((ticket) => ({
            id: ticket.id.toString(),
            title: ticket.contact.name,
            description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button
                  className={classes.button}
                  onClick={() => handleCardClick(ticket.uuid)}
                >
                  Ver Ticket
                </button>
              </div>
            ),
            draggable: true,
          })),
        style: { backgroundColor: tag.color, color: "white" },
      })),
    ];
    setFile({ lanes });
  }, [tickets, tags, classes.button]);

  useEffect(() => {
    popularCards();
  }, [popularCards]);

  const handleCardClick = (uuid) => {
    history.push("/tickets/" + uuid);
  };

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${sourceLaneId}/${cardId}`);
      await api.put(`/ticket-tags/${targetLaneId}/${cardId}`);
      toast.success(i18n.t("Ticket movido com sucesso!"));
      fetchTickets(); // Recarrega os tickets após a movimentação
    } catch (error) {
      toast.error(i18n.t("Erro ao mover ticket"));
    }
  };

  return (
    <div className={classes.root}>
      <Board
        data={file}
        onCardMoveAcrossLanes={handleCardMove}
        style={{ backgroundColor: "rgba(252, 252, 252, 0.03)" }}
      />
    </div>
  );
};

export default Kanban;
