import React from "react";
import {
    Button,
    Grid,
    Paper,
    TextField,
} from "@material-ui/core";
import Title from "./Title";

const Filters = ({
    classes,
    setDateStartTicket,
    setDateEndTicket,
    dateStartTicket,
    dateEndTicket,
    setQueueTicket,
    queueTicket,
}) => {
    const [queues, setQueues] = React.useState(queueTicket);
    const [dateStart, setDateStart] = React.useState(dateStartTicket);
    const [dateEnd, setDateEnd] = React.useState(dateEndTicket);

    return (
        <Grid item xs={12}>
            <Paper className={classes.customFixedHeightPaperLg} elevation={6}>
                <Title>Filtros</Title>
                <Grid container spacing={3}>
                    {/* Se necessário, reative o filtro de departamentos */}
                    {/* <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="queue-label">
                                Departamentos
                            </InputLabel>
                            <Select
                                labelId="queue-label"
                                id="queue-select"
                                value={queues}
                                onChange={(e) => setQueues(e.target.value)}
                            >
                                <MenuItem value={false}>
                                    Todos os Departamentos
                                </MenuItem>
                                {user.queues.map((queue) => (
                                    <MenuItem key={queue.id} value={queue.id}>
                                        {queue.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid> */}

                    <Grid item xs={12} sm={6} md={5}>
                        <TextField
                            fullWidth
                            name="dateStart"
                            label="De"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type="date"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={5}>
                        <TextField
                            fullWidth
                            name="dateEnd"
                            label="Até"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type="date"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setQueueTicket(queues);
                                setDateStartTicket(dateStart);
                                setDateEndTicket(dateEnd);
                            }}
                        >
                            Filtrar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
};

export default Filters;
