import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Button, ListItem } from "@mui/material";
import React, { useRef, useState } from 'react';
import { CSVLink } from "react-csv";
import { Link, Route, Routes } from "react-router-dom";
import './App.scss';
import DeckList from "./components/DeckList/DeckList";
import ImportPage from "./components/ImportPage/ImportPage";
import Library from "./components/Library/Library";

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuIcon from '@mui/icons-material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import PublishIcon from '@mui/icons-material/Publish';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import TableDeck from "./components/TableDeck/TableDeck";
import DeckModel from "./model/Deck.model";
import LibraryModel from "./model/Library.model";
import { ExportUtility } from "./utility/Export.utility";
import Storage from "./utility/Storage";

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" to="https://mui.com/">
                MTG - Library management
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const mdTheme = createTheme();

function App() {
    const [open, setOpen] = React.useState(true);
    const [library, setLibrary] = useState<LibraryModel>({cards: []} as LibraryModel);
    const [decks, setDecks] = useState<DeckModel[]>(() => []);
    const ref = useRef<any>();

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const downloadExport = () => {
        Storage.getLibrary()
            .then((libraryFetch) => {
                setLibrary(libraryFetch);
                Storage.getDecks()
                    .then((decksFetch) => {
                        setDecks(decksFetch);
                        ref.current.link.click();
                    });
            });
    }

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <AppBar position="absolute" open={open}>
                    <Toolbar sx={{pr: '24px'}}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && {display: 'none'}),
                            }}
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{flexGrow: 1}}>
                            Dashboard
                        </Typography>

                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    </Toolbar>
                    <Divider/>
                    <List component="nav">
                        <ListItemButton component={Link} to="/">
                            <ListItemIcon>
                                <DashboardIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Library"/>
                        </ListItemButton>
                        <ListItemButton component={Link} to="/decks">
                            <ListItemIcon>
                                <ClassIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Decks"/>
                        </ListItemButton>
                        <ListItemButton component={Link} to="/import">
                            <ListItemIcon>
                                <PublishIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Import"/>
                        </ListItemButton>
                        <ListItem >
                            <Button onClick={downloadExport}><FileDownloadIcon /> Export All</Button>
                            <CSVLink {...ExportUtility.exportAll(library, decks)} ref={ref}/>
                        </ListItem>
                    </List>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                    }}>
                    <Toolbar/>
                    <Container maxWidth="xl" sx={{mt: 2, mb: 2}}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} md={12} lg={12}>
                                <Routes>
                                    <Route path="/" element={<Library/>}/>
                                    <Route path="/import" element={<ImportPage/>}/>
                                    <Route path="/decks" element={<DeckList/>}/>
                                    <Route path="/decks/:deckName" element={<TableDeck/>}/>
                                </Routes>
                            </Grid>
                        </Grid>
                        <Copyright sx={{pt: 4}}/>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
