import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Button, Paper, Tooltip as ToolTip, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from "react-csv";
import { useParams } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "scryfall-sdk";
import { CardModel } from "../../model/Card.model";
import DeckModel from "../../model/Deck.model";
import { CardUtility } from "../../utility/Card.utility";
import { ChartResult, ChartUtility } from "../../utility/Chart.utility";
import { ExportUtility } from "../../utility/Export.utility";
import Storage from "../../utility/Storage";
import AutoComplete from "../Autocomplete/Autocomplete";
import ManaCost from "../ManaCost/ManaCost";
import styles from './TableDeck.module.scss';


interface ITableDeckProps {
}

const TableDeck = (props: ITableDeckProps) => {
    let { deckName } = useParams<{ deckName: string }>();
    const name = deckName || 'Unknown';

    const [deck, setDeck] = useState<DeckModel>({name: name, cards: [], side: []});
    const [sorted, setSorted] = useState<Map<string, CardModel[]>>();
    const [sortedSide, setSortedSide] = useState<Map<string, CardModel[]>>();

    const [dataChart, setDataChart] = useState<ChartResult[]>([]);
    const ref = useRef<any>();

    useEffect(() => {
        Storage.getDeck(name)
        .then(value => {
            if(value === null) {
                value = {name: name, cards: [], side: []} as DeckModel;
            }
            setDeck(value);
        })
    }, []);

    useEffect(() => {
        fetchCards();
        fetchData();
        fetchSide();
    }, [deck.cards, deck.side]);

    const fetchData = () => {
        let [chartResult] = ChartUtility.getData(deck)
        setDataChart(chartResult);
    }

    const fetchCards = () => {
        setSorted(fetch(deck.cards));
    }

    const fetchSide = () => {
        setSortedSide(fetch(deck.side));
    }

    const fetch = (lib: CardModel[]) => {
        let types = new Map<string, CardModel[]>();
        lib.forEach((card) => {
            let type = card.type_line;
            if(type.indexOf(' — ') > -1) {
                type = type.split(' — ')[0];
            }
            let cards = types.get(type) || [];
            cards.push(card);
            types.set(type, cards);
        });
        return types;
    }

    const addCard = (card: Card) => {
        deck.cards = add(card, deck.cards);
        changeDeck();
    }

    const changeDeck = () => {
        Storage
        .setDeck(deck)
        .then(() => {
            setDeck(deck);
            fetchCards();
            fetchData();
        });
    }

    const addCardSide = (card: Card) => {
        deck.side = add(card, deck.side);
        changeSide();
    }

    const changeSide = () => {
        Storage.setDeck(deck).then(() => {
            setDeck(deck);
            fetchSide();
        });
    }

    const add = (card: Card, models: CardModel[]) => {
        if (card !== null) {
            let cardModel = card as CardModel;
            let indexFound = models.map(c => c.id).indexOf(card.id);

            if (indexFound > -1) {
                cardModel = models[indexFound];
                cardModel.number++;
            } else {
                cardModel.number = 1;
                models = [...models, cardModel];
            }
        }

        return models;
    }

    const renderCard = () => {
        return renderTypes(sorted || new Map(), true);
    }

    const renderCardSide = () => {
        return renderTypes(sortedSide || new Map(), false);
    }

    const handleChangeCard = (input: any, id: string, lib: Map<string, CardModel[]>, isDeck: boolean) => {
        lib.forEach((cards) => {
            cards.forEach((card) => {
                if(card.id === id) {
                    card.number = +input.target.value;
                }
            });
        });

        (isDeck) ? changeDeck() : changeSide();
    }

    const handleDeleteCard = (id: string, lib: Map<string, CardModel[]>, isDeck: boolean) => {
        let cards: CardModel[] = [];
        lib.forEach((models) => {
            let indexFound = models.map(c => c.id).indexOf(id);
            if(indexFound > -1) {
                cards = [
                    ...cards,
                    ...models.slice(0, indexFound),
                    ...models.slice(indexFound + 1),
                ];
            } else {
                cards = [...cards, ...models];
            }
        });

        if(isDeck) {
            deck.cards = cards;
            changeDeck()
        } else {
            deck.side = cards;
            changeSide();
        }
    }

    const renderTypes = (cards: Map<string, CardModel[]>, isDeck: boolean) => {
        let elems: JSX.Element[] = [];
        let lastKey: string;

        cards?.forEach((value, key) => {
            if(key !== lastKey) {
                lastKey = key;
                elems.push(<b>{key} ({CardUtility.calculateNbCard(value)}) :</b>);
            }
            let lis: JSX.Element[] = [];
            value.forEach((card) => {
                lis.push(
                    <li key={card.id}>
                        <IconButton color="error" aria-label="delete" component="span" onClick={() => handleDeleteCard(card.id, cards, isDeck)}>
                            <DeleteIcon />
                        </IconButton>

                        <input
                            type={"number"}
                            value={card.number}
                            min={1}
                            className={styles.InputNumber}
                            onInput={(e) => handleChangeCard(e, card.id, cards, isDeck)}
                        />

                        <ToolTip title={<img src={card.image_uris?.normal} className={styles.Thumb}/>} placement={"right"}>
                            <Typography color="inherit" display={"inline-block"} className={styles.CardName}> {card.name} </Typography>
                        </ToolTip>

                        <ManaCost cost={card.mana_cost}/>

                    </li>
                );
            });
            elems.push(<ul>{lis}</ul>);
        });

        return elems;
    }

    return (
        <div className={styles.TableDeck}>

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
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Deck management of {deckName} ({CardUtility.calculateNbCard(deck.cards)}/60 + {CardUtility.calculateNbCard(deck.side) || 0}/15)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 2
                        }}
                    >
                        <AutoComplete addCard={addCard} placeholder={"Add card to deck"}/>
                    </Paper>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {renderCard().length === 0 &&
                        <>
                            No elements
                        </>
                        }
                        {renderCard()}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 2
                        }}
                    >
                        <AutoComplete addCard={addCardSide} placeholder={"Add card to side"}/>
                    </Paper>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {renderCardSide().length === 0 &&
                        <>
                          No elements
                        </>
                        }
                        {renderCardSide()}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={12} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Button onClick={() => ref.current.link.click()}><FileDownloadIcon /> Export to CSV</Button>
                        <CSVLink {...ExportUtility.exportDeck(deck)} ref={ref}/>
                    </Paper>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            mt: 2,
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Cost by type
                        </Typography>
                        <ResponsiveContainer width="100%" aspect={2}>
                            <BarChart data={dataChart} margin={{right: 20, left: -20}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Legend/>
                                <Tooltip/>
                                <Bar dataKey="creature" stackId="a" fill="#8884d8"/>
                                <Bar dataKey="spell" stackId="a" fill="#82ca9d"/>
                                <Bar dataKey="enchant" stackId="a" fill="#ffc658"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );

}

export default TableDeck;
