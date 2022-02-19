import { FormControl, FormHelperText, Input, InputLabel, List, ListItemButton, Paper, Button, Grid, ListItem } from "@mui/material";
import React, { useEffect, useState } from 'react';
import DeckModel from "../../model/Deck.model";
import { CardUtility } from "../../utility/Card.utility";
import styles from "../Library/Library.module.scss";
import Storage from "../../utility/Storage";

interface DeckListProps {
}

const DeckList = (props: DeckListProps) => {
    const [deckName, setDeckName] = useState<string>('');
    const [decks, setDecks] = useState<DeckModel[]>(() => []);

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
                                        <Button onClick={() => deleteDeck(deck.name)}>Delete</Button>
                                    }
                                    disablePadding
                                >
                                    <ListItemButton component="a" href={'/decks/' + deck.name}>
                                        {deck.name} ({CardUtility.calculateNbCard(deck)}/60 + {deck.side?.length || 0})
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            {decks.length === 0 && <div>No decks</div>}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default DeckList;
