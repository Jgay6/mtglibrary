import * as React from 'react';

import { v4 as uuid } from 'uuid';

import { Grid, Tooltip, Typography } from "@mui/material";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import throttle from 'lodash/throttle';

import './Autocomplete.module.scss';
import { Card } from "scryfall-sdk";
import * as Scry from "scryfall-sdk";
import styles from "../TableDeck/TableDeck.module.scss";

interface IAutocompleteProps {
    placeholder: string;
    addCard:  (card: Card) => void;
}

const generateNameRender = (option: Card) => {
    let withouttooltip = (
        <Typography variant="body2" color="text.secondary">
            {option.name}
        </Typography>
    );
    let tooltip = (
        <Tooltip
            title={
                <React.Fragment>
                    <img src={option.image_uris?.normal} className={styles.Thumb}/>
                </React.Fragment>
            }
        >
            {withouttooltip}
        </Tooltip>
    );
    return (
            <Grid container alignItems="center">
                {option.image_uris?.small ? tooltip : withouttooltip}
            </Grid>
    );
}

const AutoComplete = (autoCompleteProps: IAutocompleteProps) => {
    const [value, setValue] = React.useState<Card | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly Card[]>([]);

    const fetch = React.useMemo(
        () =>
            throttle(
                (
                    request: { input: string },
                    callback: (results?: readonly Card[]) => void,
                ) => {
                    let cards: Card[] = [];
                    Scry.Cards
                        .search('name:' + request.input.trim().toLowerCase(), {unique: 'cards', page: 1, include_multilingual: true})
                        .cancelAfterPage()
                        .on("data", card => {
                            if(cards.length < 10) {
                                cards.push(card);
                            }
                        })
                        .on("cancel", () => {
                            callback(cards);
                        })
                        .on("end", () => {
                            callback(cards);
                        });
                },
                500,
            ),
        [],
    );

    React.useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetch({ input: inputValue }, (results?: readonly Card[]) => {
            if (active) {
                let newOptions: readonly Card[] = [];

                if (value) {
                    newOptions = [value];
                }

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);
            }
        });

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    return (
        <div className="Autocomplete">
            <Autocomplete
                id={uuid()}
                sx={{ width: 300 }}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.name
                }
                filterOptions={(x) => x}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                onChange={(event: any, newValue: Card | null) => {
                    setOptions(newValue ? [newValue, ...options] : options);
                    setValue(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField {...params} label={autoCompleteProps.placeholder} fullWidth />
                )}
                renderOption={(props, option) => {
                    return (
                        <li {...props} onClick={_ => {
                            autoCompleteProps.addCard(option);
                        }}>
                            {generateNameRender(option)}
                        </li>
                    );
                }}
            />
        </div>
    );
}

export default AutoComplete;
