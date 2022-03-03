import { ResultAll, ResultDeck, Resultlibrary } from "../components/CSVReader/CSVReader";

const libraryKeys = ['cardId', 'cardNumber', 'cardName'];
const deckKeys = ['deckName', 'cardId', 'cardNumber', 'cardName', 'cardDeck'];
const allKeys = ['type', 'deckName', 'cardId', 'cardNumber', 'cardName', 'cardDeck'];

export class ImportUtility {
    static library (data: Resultlibrary) {
        let error = false;
        data.data.forEach((card) => {
            let objectKeys = Object.keys(card);
            objectKeys.forEach((key) => {
                if(libraryKeys.indexOf(key) === -1) {
                    error = true;
                }
            });
            libraryKeys.forEach((key) => {
                if(objectKeys.indexOf(key) === -1) {
                    error = true;
                }
            });
        });
        return error;
    }

    static deck (data: ResultDeck) {
        let error = false;
        data.data.forEach((card) => {
            let objectKeys = Object.keys(card);
            objectKeys.forEach((key) => {
                if(deckKeys.indexOf(key) === -1) {
                    error = true;
                }
            });
            deckKeys.forEach((key) => {
                if(objectKeys.indexOf(key) === -1) {
                    error = true;
                }
            });
        });
        return error;
    }

    static all (data: ResultAll) {
        let error = false;
        data.data.forEach((card) => {
            let objectKeys = Object.keys(card);
            objectKeys.forEach((key) => {
                if(allKeys.indexOf(key) === -1) {
                    error = true;
                }
            });
            allKeys.forEach((key) => {
                if(objectKeys.indexOf(key) === -1) {
                    error = true;
                }
            });
        });
        return error;
    }
}
