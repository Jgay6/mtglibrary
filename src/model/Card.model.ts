import { Card } from "scryfall-sdk";

export interface CardModel extends Card {
    number: number;
    used: [
        {
            deckname: string;
            used: number;
        }
    ]
}
