import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { FormControl, FormHelperText, Input, InputLabel, List, ListItemButton, Paper, Button, Grid, ListItem } from "@mui/material";
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import DeckModel from "../../model/Deck.model";
import { CardUtility } from "../../utility/Card.utility";
import { ExportUtility } from "../../utility/Export.utility";
import styles from "../Library/Library.module.scss";
import Storage from "../../utility/Storage";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


interface DeckListProps {
}

const DeckList = (props: DeckListProps) => {
    const [deckName, setDeckName] = useState<string>('');
    const [decks, setDecks] = useState<DeckModel[]>(() => []);
    const [deck, setDeck] = useState<DeckModel>(() => {return {name: '', cards: [], side: []} as DeckModel;});
    const refs = useRef<any[]>([]);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = (deck: DeckModel) => {
        setDeck(deck);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleValidate = () => {
        setOpen(false);
        deleteDeck(deck.name);
    };

    useEffect(() => {
        Storage.getDecks()
            .then((value) => {
                if(value !== null) {
                    setDecks(value);
                }
            });
    }, []);

    const handlechange = (event: any) => {
        setDeckName(event.target.value);
    }

    const createDeck = () => {
        Storage.setDeck({name: deckName, cards: [], side: []})
            .then((deck) => {
                setDeckName('');
                let tmp = Object.assign([], decks);
                tmp.push(deck);
                setDecks(tmp);
            });
    }

    const deleteDeck = (deckName: string) => {
        Storage.removeDeck(deckName);
        let tmp: DeckModel[] = Object.assign([], decks);
        setDecks(tmp.filter(deck => deck.name !== deckName));
    }

    const addToRefs = (el: any) => {
        if (el && !refs.current.includes(el)) {
            refs.current.push(el);
        }
    };

    return (
        <div className={styles.Library}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <FormControl>
                            <InputLabel htmlFor="my-input">Deck name</InputLabel>
                            <Input id="my-input" aria-describedby="my-helper-text" value={deckName} onChange={handlechange} />
                            <FormHelperText id="my-helper-text">Name of the future deck</FormHelperText>
                        </FormControl>
                        <Button onClick={createDeck}>Create</Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8} lg={8}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <List component="nav">
                            {decks.map((deck, i) => (
                                <ListItem
                                    key={i}
                                    secondaryAction={
                                        <div>
                                            <Button onClick={() => refs.current[i].link.click()}><FileDownloadIcon /> Export to CSV</Button>
                                            <CSVLink {...ExportUtility.exportDeck(deck)} ref={addToRefs}/>
                                            <Button color="error" onClick={() => handleClickOpen(deck)}>Delete</Button>
                                        </div>
                                    }
                                    disablePadding
                                >
                                    <ListItemButton component={Link} to={'/decks/' + deck.name}>
                                        {deck.name} ({CardUtility.calculateNbCard(deck.cards)}/60 + {CardUtility.calculateNbCard(deck.side) || 0}/15)
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            {decks.length === 0 && <div>No decks</div>}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure to delete " + deck.name + "?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        If you agree to delete deck {deck.name}, you will loose all data of your deck without any chances to retreive it.
                        Are you sure to delete this deck?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button color="error" onClick={handleValidate} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeckList;
