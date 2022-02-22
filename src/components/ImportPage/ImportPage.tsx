import { Button, Grid, Paper, Typography } from "@mui/material";
import React, { useState } from 'react';
import './ImportPage.module.scss';
import { CardIdentifier } from "scryfall-sdk/out/api/Cards";
import { CardModel } from "../../model/Card.model";
import DeckModel from "../../model/Deck.model";
import LibraryModel from "../../model/Library.model";
import { IAll, IDeck, Ilibrary } from "../../utility/Export.utility";
import { ImportUtility } from "../../utility/Import.utility";
import Storage from "../../utility/Storage";
import CSVReader, { ResultAll, Resultlibrary, ResultDeck } from "../CSVReader/CSVReader";

import { Card } from "scryfall-sdk";
import * as Scry from "scryfall-sdk";

interface IImportPageProps {
}

const ImportPage = (props: IImportPageProps) => {
    const [uploadAllFile, setUploadAllFile] = useState<ResultAll>();
    const [allLibraryCardsUploaded, setAllLibraryCardsUploaded] = useState<number>();
    const [allDecksCardsUploaded, setAllDecksCardsUploaded] = useState<number>();
    const [allDecksUploaded, setAllDecksUploaded] = useState<number>();
    const [allError, setAllError] = useState<boolean>(false);

    const [uploadLibraryFile, setUploadLibraryFile] = useState<Resultlibrary>();
    const [libraryLibraryCardsUploaded, setLibraryLibraryCardsUploaded] = useState<number>();
    const [libraryError, setLibraryError] = useState<boolean>(false);

    const [uploadDeckFile, setUploadDeckFile] = useState<ResultDeck>();
    const [deckDecksCardsUploaded, setDeckDecksCardsUploaded] = useState<number>();
    const [deckDecksUploaded, setDeckDecksUploaded] = useState<number>();
    const [deckError, setDeckError] = useState<boolean>(false);

    const uploadLibrary = () => {
        setLibraryLibraryCardsUploaded(0);

        let libraryIds: CardIdentifier[] = [];
        let libraryNumber: Map<string, number> = new Map();

        uploadLibraryFile?.data.forEach((row: Ilibrary) => {
            libraryIds.push({id: row.cardId} as CardIdentifier)
            libraryNumber.set(row.cardId, row.cardNumber);
        });

        let libraryCards: Card[] = [];
        Scry.Cards.collection(...libraryIds)
        .on('data', (data) => {
            console.log(data);
            libraryCards.push(data);
        })
        .on('end', () => {
            let library: LibraryModel = {cards: []} as LibraryModel;
            libraryCards.forEach((card: Card) => {
                let cardModel = card as CardModel;
                cardModel.number = libraryNumber.get(card.id) || 1;
                library.cards.push(cardModel);
            });
            Storage.setLibrary(library);
            setAllLibraryCardsUploaded(library.cards.length);
        });
    }

    const uploadDeck = () => {
        setDeckDecksCardsUploaded(0);
        setDeckDecksUploaded(0);

        let decksIds: Map<string, CardIdentifier[]> = new Map();
        let decksNumber: Map<string, Map<string, number>> = new Map();

        uploadDeckFile?.data.forEach((row: IDeck) => {
            let deckName = row.deckName || '';

            let deckIds = decksIds.get(deckName) || [];
            deckIds.push({id: row.cardId} as CardIdentifier);
            decksIds.set(deckName, deckIds);

            let deckNumber = decksNumber.get(deckName) || new Map();
            deckNumber.set(row.cardId, row.cardNumber);
            decksNumber.set(deckName, deckNumber);
        });

        decksIds.forEach((deckIds, deckName) => {
            let deckCards: Card[] = [];
            Scry.Cards.collection(...deckIds)
            .on('data', (data) => {
                deckCards.push(data);
            })
            .on('end', () => {
                let deck: DeckModel = {name: deckName, cards: [], side: []} as DeckModel;

                deckCards.forEach((card: Card) => {
                    let cardModel = card as CardModel;
                    cardModel.number = decksNumber.get(deckName)?.get(cardModel.id) || 1;
                    deck.cards.push(cardModel);
                });

                Storage.setDeck(deck);

                setAllDecksCardsUploaded((allDecksCardsUploaded || 0) + deck.cards.length);
                setAllDecksUploaded((allDecksUploaded || 0) + 1);
            });
        });
    }

    const uploadAll = () => {
        setAllLibraryCardsUploaded(0);
        setAllDecksCardsUploaded(0);
        setAllDecksUploaded(0);

        let libraryIds: CardIdentifier[] = [];
        let libraryNumber: Map<string, number> = new Map();

        let decksIds: Map<string, CardIdentifier[]> = new Map();
        let decksNumber: Map<string, Map<string, number>> = new Map();

        uploadAllFile?.data.forEach((row: IAll) => {
            if (row.type === 'library') {
                libraryIds.push({id: row.cardId} as CardIdentifier)
                libraryNumber.set(row.cardId, row.cardNumber);
            } else if (row.type === 'deck') {
                let deckName = row.deckName || '';

                let deckIds = decksIds.get(deckName) || [];
                deckIds.push({id: row.cardId} as CardIdentifier);
                decksIds.set(deckName, deckIds);

                let deckNumber = decksNumber.get(deckName) || new Map();
                deckNumber.set(row.cardId, row.cardNumber);
                decksNumber.set(deckName, deckNumber);
            }
        });

        let libraryCards: Card[] = [];
        Scry.Cards.collection(...libraryIds)
        .on('data', (data) => {
            console.log(data);
            libraryCards.push(data);
        })
        .on('end', () => {
            let library: LibraryModel = {cards: []} as LibraryModel;
            libraryCards.forEach((card: Card) => {
                let cardModel = card as CardModel;
                cardModel.number = libraryNumber.get(card.id) || 1;
                library.cards.push(cardModel);
            });
            Storage.setLibrary(library);
            setAllLibraryCardsUploaded(library.cards.length);
        });

        decksIds.forEach((deckIds, deckName) => {
            let deckCards: Card[] = [];
            Scry.Cards.collection(...deckIds)
            .on('data', (data) => {
                deckCards.push(data);
            })
            .on('end', () => {
                let deck: DeckModel = {name: deckName, cards: [], side: []} as DeckModel;

                deckCards.forEach((card: Card) => {
                    let cardModel = card as CardModel;
                    cardModel.number = decksNumber.get(deckName)?.get(cardModel.id) || 1;
                    deck.cards.push(cardModel);
                });

                Storage.setDeck(deck);

                setAllDecksCardsUploaded((allDecksCardsUploaded || 0) + deck.cards.length);
                setAllDecksUploaded((allDecksUploaded || 0) + 1);
            });
        });

    }

    return (
        <div className="ImportPage">
            <Grid container spacing={3}>
                <Grid item xs={12} md={12} lg={12}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="#D50000FF"
                            noWrap
                            textAlign={"center"}
                            sx={{flexGrow: 1}}>
                            Warning : All data previously entered will be erased on import !
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Import all
                        </Typography>

                        <CSVReader
                            onUploadAccepted={(results: ResultAll) => {
                                if(!ImportUtility.all(results)) {
                                    setAllError(false);
                                    setUploadAllFile(results);
                                } else {
                                    setAllError(true);
                                }
                            }}
                        />
                        <Button onClick={uploadAll} disabled={allError}>Upload</Button>

                        {allError &&
                        <p>
                          <Typography
                              component="h1"
                              variant="h6"
                              color="#D50000FF"
                              noWrap
                              textAlign={"center"}
                              sx={{flexGrow: 1}}>
                            Wrong file format
                          </Typography>
                        </p>
                        }

                        {allLibraryCardsUploaded &&
                        <p>Library cards uploaded: {allLibraryCardsUploaded}</p>
                        }
                        {allDecksUploaded &&
                        <p>Decks uploaded: {allDecksUploaded}</p>
                        }
                        {allDecksCardsUploaded &&
                        <p>Decks cards uploaded: {allDecksCardsUploaded}</p>
                        }
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Import library
                        </Typography>

                        <CSVReader
                            onUploadAccepted={(results: Resultlibrary) => {
                                if(!ImportUtility.library(results)) {
                                    setLibraryError(false);
                                    setUploadLibraryFile(results);
                                } else {
                                    setLibraryError(true);
                                }
                            }}
                        />
                        <Button onClick={uploadLibrary} disabled={libraryError}>Upload</Button>

                        {libraryError &&
                        <p>
                          <Typography
                              component="h1"
                              variant="h6"
                              color="#D50000FF"
                              noWrap
                              textAlign={"center"}
                              sx={{flexGrow: 1}}>
                            Wrong file format
                          </Typography>
                        </p>
                        }

                        {libraryLibraryCardsUploaded &&
                        <p>Library cards uploaded: {libraryLibraryCardsUploaded}</p>
                        }
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Import deck
                        </Typography>

                        <CSVReader
                            onUploadAccepted={(results: ResultDeck) => {
                                if(!ImportUtility.deck(results)) {
                                    setDeckError(false);
                                    setUploadDeckFile(results);
                                } else {
                                    setDeckError(true);
                                }
                            }}
                        />
                        <Button onClick={uploadDeck} disabled={deckError}>Upload</Button>

                        {deckError &&
                        <Typography
                            component="h1"
                            variant="h6"
                            color="#D50000FF"
                            noWrap
                            textAlign={"center"}
                            sx={{flexGrow: 1}}>
                          Wrong file format
                        </Typography>
                        }

                        {deckDecksUploaded &&
                        <p>Decks uploaded: {deckDecksUploaded}</p>
                        }
                        {deckDecksCardsUploaded &&
                        <p>Decks cards uploaded: {deckDecksCardsUploaded}</p>
                        }
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default ImportPage;
