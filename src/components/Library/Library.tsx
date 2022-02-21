import { Button, Grid, LinearProgress, Paper, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from 'react';
import { DataGrid, GridColDef, GridOverlay, GridValueGetterParams } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CSVLink } from "react-csv";
import { Card } from "scryfall-sdk";
import { CardModel } from "../../model/Card.model";

import LibraryModel from "../../model/Library.model";
import { ExportUtility } from "../../utility/Export.utility";
import Storage from "../../utility/Storage";
import AutoComplete from "../Autocomplete/Autocomplete";
import styles from './Library.module.scss';

function CustomLoadingOverlay() {
    return (
        <GridOverlay>
            <div style={{position: 'absolute', top: 0, width: '100%'}}>
                <LinearProgress/>
            </div>
        </GridOverlay>
    );
}

interface LibraryProps {
}

const Library = (props: LibraryProps) => {
    const [library, setLibrary] = useState<LibraryModel>({cards: []} as LibraryModel);
    const [data, setData] = useState<CardModel[]>(() => []);
    const [loading, setLoading] = useState<boolean>(false);
    const ref = useRef<any>();

    useEffect(() => {
        setLoading(true);
        Storage.getLibrary()
        .then(value => {
            setLibrary(value);
            setData(value.cards)
            setLoading(false);
        })
    }, []);

    const addCard = (card: Card) => {
        if (data !== null) {
            setLoading(true);
            let cardModel = card as CardModel;
            let indexFound = data.map(c => c.id).indexOf(card.id);

            if (indexFound > -1) {
                cardModel = data[indexFound];
                cardModel.number++;
                setData((prevRows) => {
                    Storage.setLibrary({cards: prevRows}).then(() => setLoading(false));
                    return prevRows;
                });
            } else {
                cardModel.number = 1;
                setData((prevRows) => {
                    let tab = [...data, cardModel];
                    Storage.setLibrary({cards: tab}).then(() => setLoading(false));
                    return tab;
                });
            }
        }
    }

    const decrease = (id: string) => {
        if (data !== null) {
            setLoading(true);
            let indexFound = data.map(c => c.id).indexOf(id);
            if (indexFound > -1) {
                let card = data[indexFound];
                card.number--;
                if (card.number <= 0) {
                    setData((prevRows) => {
                        const rowToDeleteIndex = data.findIndex(x => x.id === id);
                        let tab = [
                            ...data.slice(0, rowToDeleteIndex),
                            ...data.slice(rowToDeleteIndex + 1),
                        ];
                        Storage.setLibrary({cards: tab}).then(() => setLoading(false));
                        return tab;
                    });
                } else {
                    setData((prevRows) => {
                        Storage.setLibrary({cards: prevRows}).then(() => setLoading(false));
                        return prevRows;
                    });
                }
            }
        }
    }

    const increase = (id: string) => {
        if (data !== null) {
            setLoading(true);
            let indexFound = data.map(c => c.id).indexOf(id);
            if (indexFound > -1) {
                let card = data[indexFound];
                card.number++;
                setData((prevRows) => {
                    Storage.setLibrary({cards: prevRows}).then(() => setLoading(false));
                    return prevRows;
                });
            }
        }
    }

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
            renderCell: (params: GridValueGetterParams) => (
                <Tooltip
                    title={
                        <React.Fragment>
                            {/*{JSON.stringify(params.row.image_uris)}*/}
                            <img src={params.row.image_uris?.small}/>
                        </React.Fragment>
                    }
                >
                    <Typography color="inherit">{params.row.name}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'mana_cost',
            headerName: 'Mana Cost',
            width: 150,
            valueGetter: (params: GridValueGetterParams) =>
                `${params.row.mana_cost || ''}`,
        },
        {
            field: 'estimated_price',
            headerName: 'Estimated price',
            width: 130,
            valueGetter: (params: GridValueGetterParams) =>
                `${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(Number(params.row.prices.eur)) || '0 €'}`,
        },
        {
            field: 'estimated_price_total',
            headerName: 'Estimated price total',
            width: 130,
            valueGetter: (params: GridValueGetterParams) =>
                `${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(Number(params.row.prices.eur) * params.row.number) || '0 €'}`,
        },
        {
            field: 'number',
            headerName: 'Number',
            width: 200,
            renderCell: (params: GridValueGetterParams) => (
                <div>
                    <Button variant="contained" size="small" onClick={() => decrease(params.row.id)} sx={{mr: 2}}>-1</Button>
                    {params.row.number}
                    <Button variant="contained" size="small" onClick={() => increase(params.row.id)} sx={{ml: 2}}>+1</Button>
                </div>
            )

        },
        {field: 'decks', headerName: 'In decks', width: 130},
    ];

    return (
        <div className={styles.Library}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={9} lg={9}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <AutoComplete addCard={addCard}/>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >

                        <Button onClick={() => ref.current.link.click()}><FileDownloadIcon /> Export to CSV</Button>
                        <CSVLink {...ExportUtility.exportLibrary(library)} ref={ref}/>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 680,
                        }}
                    >
                        <DataGrid
                            columns={columns}
                            rows={data}
                            initialState={{
                                sorting: {
                                    sortModel: [{field: 'name', sort: 'asc'}],
                                },
                            }}
                            components={{
                                LoadingOverlay: CustomLoadingOverlay,
                            }}
                            componentsProps={{toolbar: {printOptions: {disableToolbarButton: true}}}}
                            autoPageSize
                            pagination
                            disableSelectionOnClick
                            loading={loading}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default Library;
