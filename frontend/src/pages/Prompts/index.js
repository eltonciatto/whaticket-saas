import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DeleteOutline, Edit } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import PromptModal from "../../components/PromptModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { SocketContext } from "../../context/Socket/SocketContext";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  redBox: {
    backgroundColor: "#ffcccc",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const promptReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_PROMPTS":
      const updatedPrompts = state.slice();
      action.payload.forEach((prompt) => {
        const existingIndex = updatedPrompts.findIndex((p) => p.id === prompt.id);
        if (existingIndex !== -1) {
          updatedPrompts[existingIndex] = prompt;
        } else {
          updatedPrompts.push(prompt);
        }
      });
      return updatedPrompts;
    case "UPDATE_PROMPTS":
      const updatedState = state.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
      return updatedState.includes(action.payload)
        ? updatedState
        : [action.payload, ...state];
    case "DELETE_PROMPT":
      return state.filter((p) => p.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const Prompts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const socketManager = useContext(SocketContext);

  const [prompts, dispatch] = useReducer(promptReducer, []);
  const [loading, setLoading] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const companyId = user.companyId;

  useEffect(() => {
    const checkPlanAccess = async () => {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useOpenAi) {
        toast.error(
          "Esta empresa não possui permissão para acessar essa página! Redirecionando..."
        );
        setTimeout(() => {
          history.push("/");
        }, 1000);
      }
    };
    checkPlanAccess();
  }, [companyId, getPlanCompany, history]);

  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    loadPrompts();
  }, []);

  useEffect(() => {
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-prompt`, (data) => {
      if (["update", "create"].includes(data.action)) {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      } else if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId, socketManager]);

  const handleOpenPromptModal = () => {
    setSelectedPrompt(null);
    setPromptModalOpen(true);
  };

  const handleClosePromptModal = () => {
    setSelectedPrompt(null);
    setPromptModalOpen(false);
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      await api.delete(`/prompt/${promptId}`);
      toast.info(i18n.t("prompts.messages.deleteSuccess"));
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
    setConfirmModalOpen(false);
  };

  return (
    <MainContainer>
      <Paper className={classes.redBox} variant="outlined">
        <Typography variant="body1">
          <strong>Aviso Importante:</strong> Para todos os usuários do Whaticket que notaram uma interrupção no funcionamento do OpenAI, gostaríamos de esclarecer que isso não se trata de um erro do sistema. O OpenAI oferece um crédito gratuito de $5 USD para novos cadastros, porém, este benefício também está sujeito a um limite de tempo, geralmente em torno de três meses. Quando o crédito disponibilizado se esgota, é necessário recarregar a conta para continuar utilizando o serviço. É importante estar ciente dessa política para garantir uma experiência contínua e sem interrupções no uso do OpenAI com o Whaticket. Se você notou que o serviço parou de funcionar, verifique se seu crédito gratuito expirou e considere a recarga da conta, se necessário. Estamos à disposição para ajudar e esclarecer quaisquer dúvidas adicionais que possam surgir. Obrigado pela compreensão e continuaremos trabalhando para oferecer o melhor serviço possível aos nossos usuários.
        </Typography>
        <Typography variant="body1">
          <strong>Links Úteis:</strong>
          <br />
          Uso: <a href="https://platform.openai.com/usage">https://platform.openai.com/usage</a>
          <br />
          Fatura: <a href="https://platform.openai.com/account/billing/overview">https://platform.openai.com/account/billing/overview</a>
          <br />
          API: <a href="https://platform.openai.com/api-keys">https://platform.openai.com/api-keys</a>
        </Typography>
      </Paper>

      <ConfirmationModal
        title={
          selectedPrompt &&
          `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
      >
        {i18n.t("prompts.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <PromptModal
        open={promptModalOpen}
        onClose={handleClosePromptModal}
        promptId={selectedPrompt?.id}
      />

      <MainHeader>
        <Title>{i18n.t("prompts.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" onClick={handleOpenPromptModal}>
            {i18n.t("prompts.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">{i18n.t("prompts.table.name")}</TableCell>
              <TableCell align="left">{i18n.t("prompts.table.queue")}</TableCell>
              <TableCell align="left">{i18n.t("prompts.table.max_tokens")}</TableCell>
              <TableCell align="center">{i18n.t("prompts.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell align="left">{prompt.name}</TableCell>
                <TableCell align="left">{prompt.queue.name}</TableCell>
                <TableCell align="left">{prompt.maxTokens}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEditPrompt(prompt)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      setConfirmModalOpen(true);
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
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

export default Prompts;
