import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import FileModal from "../../components/FileModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_FILES":
      return [...state, ...action.payload];
    case "UPDATE_FILES":
      return state.map((file) =>
        file.id === action.payload.id ? action.payload : file
      );
    case "DELETE_FILE":
      return state.filter((file) => file.id !== action.payload);
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

const FileLists = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedFileList, setSelectedFileList] = useState(null);
  const [deletingFileList, setDeletingFileList] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [files, dispatch] = useReducer(reducer, []);
  const [fileListModalOpen, setFileListModalOpen] = useState(false);
  const socketManager = useContext(SocketContext);

  const fetchFileLists = useCallback(async () => {
    try {
      const { data } = await api.get("/files/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_FILES", payload: data.files });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchFileLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchFileLists]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on(`company-${user.companyId}-file`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_FILES", payload: data.files });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_FILE", payload: +data.fileId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user]);

  const handleOpenFileListModal = () => {
    setSelectedFileList(null);
    setFileListModalOpen(true);
  };

  const handleCloseFileListModal = () => {
    setSelectedFileList(null);
    setFileListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditFileList = (fileList) => {
    setSelectedFileList(fileList);
    setFileListModalOpen(true);
  };

  const handleDeleteFileList = async (fileListId) => {
    try {
      await api.delete(`/files/${fileListId}`);
      toast.success(i18n.t("files.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingFileList(null);
    dispatch({ type: "RESET" });
    setPageNumber(1);
    fetchFileLists();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteFileList(deletingFileList.id)}
      >
        {i18n.t("files.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <FileModal
        open={fileListModalOpen}
        onClose={handleCloseFileListModal}
        reload={fetchFileLists}
        aria-labelledby="form-dialog-title"
        fileListId={selectedFileList && selectedFileList.id}
      />
      <MainHeader>
        <Title>
          {i18n.t("files.title")} ({files.length})
        </Title>
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
          <Button variant="contained" color="primary" onClick={handleOpenFileListModal}>
            {i18n.t("files.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("files.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("files.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {files.map((fileList) => (
                <TableRow key={fileList.id}>
                  <TableCell align="center">{fileList.name}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditFileList(fileList)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingFileList(fileList);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={2} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default FileLists;
