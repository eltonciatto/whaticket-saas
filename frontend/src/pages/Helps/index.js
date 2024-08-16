import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Paper, Typography, Modal } from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles((theme) => ({
  mainPaperContainer: {
    overflowY: "auto",
    maxHeight: "calc(100vh - 200px)",
    padding: theme.spacing(2),
  },
  mainPaper: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
  },
  helpPaper: {
    position: "relative",
    width: "100%",
    minHeight: "300px",
    padding: theme.spacing(2),
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(1),
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "scale(1.03)",
      boxShadow: theme.shadows[6],
    },
  },
  videoThumbnail: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  videoTitle: {
    marginTop: theme.spacing(1),
    fontWeight: "bold",
  },
  videoDescription: {
    maxHeight: "60px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  videoModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoModalContent: {
    width: "90%",
    maxWidth: "960px",
    aspectRatio: "16/9",
    backgroundColor: "white",
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    position: "relative",
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const helps = await list();
      setRecords(helps);
    };
    fetchData();
  }, [list]);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%" }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    );
  };

  const renderHelps = () => {
    return (
      <div className={classes.mainPaper}>
        {records.length ? (
          records.map((record, key) => (
            <Paper
              key={key}
              className={classes.helpPaper}
              onClick={() => openVideoModal(record.video)}
            >
              <img
                src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                alt="Thumbnail"
                className={classes.videoThumbnail}
              />
              <Typography variant="subtitle1" className={classes.videoTitle}>
                {record.title}
              </Typography>
              <Typography variant="body2" className={classes.videoDescription}>
                {record.description}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography variant="h6">Nenhum vídeo disponível no momento.</Typography>
        )}
      </div>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("helps.title")} ({records.length})</Title>
        <MainHeaderButtonsWrapper>
          {/* Espaço para adicionar botões no futuro, caso necessário */}
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <div className={classes.mainPaperContainer}>{renderHelps()}</div>
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;
