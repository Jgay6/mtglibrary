import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Button, Grid, Paper, Tooltip as ToolTip, Typography } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from "react-csv";
import { useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "scryfall-sdk";
import { CardModel } from "../../model/Card.model";
import DeckModel from "../../model/Deck.model";
import { CardUtility } from "../../utility/Card.utility";
import { ChartUtility, ChartResult, DetailsResult } from "../../utility/Chart.utility";
import { ExportUtility } from "../../utility/Export.utility";
import Storage from "../../utility/Storage";
import AutoComplete from "../Autocomplete/Autocomplete";
import styles from "../DeckDetails/DeckDetails.module.scss";

interface DeckDetailsProps {
}

const DeckDetails = (props: DeckDetailsProps) => {
    let { deckName } = useParams<{ deckName: string }>();
    let name: string = deckName || '';

    const [deck, setDeck] = useState<DeckModel>({name: name, cards: [], side: []});
    const [data, setData] = useState<CardModel[]>([]);
    const [dataChart, setDataChart] = useState<ChartResult[]>([]);
    const [dataDetails, setDataDetails] = useState<DetailsResult>({creature: 0, spell: 0, enchant: 0, land: 0});
    const ref = useRef<any>();

    const sortCards = (cards: CardModel[]) => {
        cards.sort((t1, t2) => {
            const name1 = t1.name.toLowerCase();
            const name2 = t2.name.toLowerCase();
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
        });
    }

    const addCard = (card: Card) => {
        if(data !== null) {
            let cardModel = card as CardModel;
            let indexFound = data.map(c => c.id).indexOf(card.id);

            if(indexFound > -1) {
                cardModel = data[indexFound];
                cardModel.number++;
                setData(data);
            } else {
                cardModel.number = 1;
                let tmp = [...data, cardModel];
                sortCards(tmp);
                setData(tmp);
            }
        }
    }

    const decrease = (id: string) => {
        if(data !== null) {
            let indexFound = data.map(c => c.id).indexOf(id);
            if(indexFound > -1) {
                let card = data[indexFound];
                card.number--;
                if(card.number <= 0) {
                    setData((prevrow) => {
                        const rowToDeleteIndex = prevrow.findIndex(x => x.id === id);
                        return [
                            ...prevrow.slice(0, rowToDeleteIndex),
                            ...prevrow.slice(rowToDeleteIndex + 1),
                        ];
                    });
                } else {
                    setData(Object.assign([], data));
                }
            }
        }
    }

    const increase = (id: string) => {
        if(data !== null) {
            let indexFound = data.map(c => c.id).indexOf(id);
            if(indexFound > -1) {
                setData((prevrow) => {
                    let card = prevrow[indexFound];
                    card.number++;
                    return Object.assign([], prevrow);
                });
            }
        }
    }

    useEffect(() => {
        Storage.getDeck(name)
            .then(value => {
                if(value === null) {
                    value = {name: name, cards: [], side: []} as DeckModel;
                }
                value.cards.sort((t1, t2) => {
                    const name1 = t1.name.toLowerCase();
                    const name2 = t2.name.toLowerCase();
                    if (name1 > name2) { return 1; }
                    if (name1 < name2) { return -1; }
                    return 0;
                });
                setDeck(value);
                setData(value.cards);
            })
    }, []);

    useEffect(() => {
        deck.cards = data;
        Storage.setDeck(deck);
        let [chartResult, detailsResult] = ChartUtility.getData(deck)
        setDataChart(chartResult);
        setDataDetails(detailsResult);
    }, [data]);

    return (
        <div className={styles.DeckDetails}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8} lg={9}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 2
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Deck management of {deckName} ({CardUtility.calculateNbCard(deck)}/60 + {deck.side.length})
                        </Typography>
                    </Paper>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 2
                        }}
                    >
                        <AutoComplete addCard={addCard}/>
                    </Paper>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Mana Cost</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Number</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.length === 0 &&
                                        <TableRow
                                            key={0}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                          <TableCell component="th" scope="row">
                                              No rows
                                          </TableCell>
                                        </TableRow>
                                      }
                                    {data.map((row) => (
                                        <TableRow
                                            key={row.name}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <ToolTip
                                                    title={
                                                        <React.Fragment>
                                                            <img src={row.image_uris?.small} />
                                                        </React.Fragment>
                                                    }
                                                >
                                                    <Typography color="inherit">{row.name}</Typography>
                                                </ToolTip>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {row.mana_cost}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {row.type_line}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Button variant="contained" size="small" onClick={() => decrease(row.id)} sx={{mr: 2}}>-1</Button>
                                                {row.number}
                                                <Button variant="contained" size="small" onClick={() => increase(row.id)} sx={{ml: 2}}>+1</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            ml: 2,
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
                            ml: 2,
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
                        <ResponsiveContainer width="185%" aspect={3}>
                            <BarChart data={dataChart} margin={{right: 300}}>
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
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            ml: 2,
                            mt: 2,
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Details
                        </Typography>
                        <p>Land: {dataDetails.land}</p>
                        <p>Creature: {dataDetails.creature}</p>
                        <p>Spell: {dataDetails.spell}</p>
                        <p>Enchant: {dataDetails.enchant}</p>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default DeckDetails;
