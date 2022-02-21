import DeckModel from "../model/Deck.model";
import LibraryModel from "../model/Library.model";
import Storage from "./Storage";

export interface IDeck {
    deckName: string;
    cardId: string;
    cardNumber: number;
    cardName: string;
}
export const headerDeck = [
    { label: "deckName", key: "deckName" },
    { label: "cardId", key: "cardId" },
    { label: "cardName", key: "cardName" },
    { label: "cardNumber", key: "cardNumber" },
];

export interface Ilibrary {
    cardId: string;
    cardNumber: number;
    cardName: string;
}
export const headerLibrary = [
    { label: "cardId", key: "cardId" },
    { label: "cardName", key: "cardName" },
    { label: "cardNumber", key: "cardNumber" },
];

export interface IAll {
    type: string;
    deckName?: string;
    cardId: string;
    cardNumber: number;
    cardName: string;
}
export const headerAll = [
    { label: "type", key: "type" },
    { label: "deckName", key: "deckName" },
    { label: "cardId", key: "cardId" },
    { label: "cardName", key: "cardName" },
    { label: "cardNumber", key: "cardNumber" },
];

export class ExportUtility {
    static exportDeck(deck: DeckModel) {
        let data: IDeck[] = [];

        for(let card of deck.cards) {
            data.push({deckName: deck.name, cardId: card.id, cardName: card.name, cardNumber: card.number} as IDeck);
        }

        return {
            data: data,
            headers: headerDeck,
            filename: deck.name + '_deck_export_' + Date.now() + '.csv'
        };
    }

    static exportLibrary(library: LibraryModel) {
        let data: Ilibrary[] = [];

        for(let card of library.cards) {
            data.push({cardId: card.id, cardName: card.name, cardNumber: card.number} as Ilibrary);
        }

        return {
            data: data,
            headers: headerLibrary,
            filename: 'library_export_' + Date.now() + '.csv'
        };
    }

    static exportAll(library: LibraryModel, decks: DeckModel[]): {data: IAll[], headers: {label: string, key: string}[], filename: string} {
        let data: IAll[] = [];

        for(let card of library.cards) {
            data.push({type: 'library', cardId: card.id, cardName: card.name, cardNumber: card.number} as IAll);
        }
        for(let deck of decks) {
            for (let card of deck.cards) {
                data.push({type: 'deck', deckName: deck.name, cardId: card.id, cardName: card.name, cardNumber: card.number} as IAll);
            }
        }

        return {
            data: data,
            headers: headerAll,
            filename: 'all_export_' + Date.now() + '.csv'
        };
    }
}
