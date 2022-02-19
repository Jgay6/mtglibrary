import { CardModel } from "./Card.model";


type DeckModel = {
    name: string;
    cards: CardModel[];
    side: CardModel[];
}

export default DeckModel;
