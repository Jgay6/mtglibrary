import { CardModel } from "../model/Card.model";

export class CardUtility {
    static displayCost(manaCost: string | null | undefined) {
        if (manaCost === undefined || manaCost === null) return '';
        return manaCost
            .replaceAll(/{(\d+)}/ig, '$1 Incolore')
            .replaceAll('{G}', '1 Green')
            .replaceAll('{U}', '1 Blue')
            .replaceAll('{W}', '1 White')
            .replaceAll('{B}', '1 Black')
            .replaceAll('{R}', '1 Red');
    }

    static canUsedInDeck(card: CardModel, number: number) {
        let cardNumber = card.number;
        let used = 0;
        for(let deck of card.used) {
            used += deck.used;
        }
        return (cardNumber >= (used + number));
    }

    static calculateNbCard = (cards: CardModel[]) => {
        let result = 0;
        cards.forEach(card => result += card.number);
        return result;
    }
}
