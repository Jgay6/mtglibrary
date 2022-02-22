import { Button, Grid } from "@mui/material";
import React from 'react';
import { IAll, IDeck, Ilibrary } from "../../utility/Export.utility";
import styles from "./CSVReader.module.scss";
import { useCSVReader } from 'react-papaparse';

export interface ResultAll {
    data: IAll[];
    errors: any;
    meta: any;
}

export interface Resultlibrary {
    data: Ilibrary[];
    errors: any;
    meta: any;
}

export interface ResultDeck {
    data: IDeck[];
    errors: any;
    meta: any;
}

interface CSVReaderProps {
    onUploadAccepted: (result: any) => void;
}

const CSVReader = (props: CSVReaderProps) => {
    const {CSVReader} = useCSVReader();

    return (
        <CSVReader
            onUploadAccepted={props.onUploadAccepted}
            config={{header: true, dynamicTyping: true}}
            cssClass="csv-reader-input"
            inputStyle={{color: 'red'}}
        >
            {({
                  getRootProps,
                  acceptedFile,
                  ProgressBar,
                  getRemoveFileProps,
              }: any) => (
                <Grid container spacing={2}>
                    <Grid item xs={2} md={2} lg={3}>
                        <Button {...getRootProps()}>
                            Browse file
                        </Button>
                    </Grid>

                    <Grid item xs={6} md={6} lg={6}>
                        <div className={styles.acceptedFile}>
                            {acceptedFile && acceptedFile.name}
                        </div>
                    </Grid>

                    <Grid item xs={2} md={2} lg={3}>
                        <Button {...getRemoveFileProps()}>
                            Remove
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={12} lg={12}>
                        <ProgressBar/>
                    </Grid>
                </Grid>
            )}
        </CSVReader>
    );
}

export default CSVReader;
