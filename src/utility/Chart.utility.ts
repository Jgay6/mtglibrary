import { CardModel } from "../model/Card.model";
import DeckModel from "../model/Deck.model";

interface Data {
    [key: string]: CardModel[];
}

export interface ChartResult {
    name: string;
    creature: number;
    spell: number;
    enchant: number;
}

export interface DetailsResult {
    cards: DetailsResultCard;
    side: DetailsResultCard;
}

export interface DetailsResultCard {
    creature: number;
    spell: number;
    enchant: number;
    land: number;
}

export class ChartUtility {
    static getData(deck: DeckModel): [ ChartResult[], DetailsResult ]  {
        let data: Data = {};
        deck.cards.forEach(card => {
            let tmp = data[card.cmc];
            if(tmp === undefined || tmp === null) {
                tmp = []
            }
            data[card.cmc] = [...tmp, card]
        });

        let chartResults: ChartResult[] = [];
        let detailsResults: DetailsResult = {cards: {creature: 0, spell: 0, enchant: 0, land: 0}, side: {creature: 0, spell: 0, enchant: 0, land: 0}};
        for(let key of Object.keys(data)) {
            let tmp = {name: 'Cost ' + key, creature: 0, spell: 0, enchant: 0} as ChartResult;

            let row = data[key];
            for(let card of row) {
                if(this.isCreature(card)) {
                    tmp.creature += card.number;
                    detailsResults.cards.creature += card.number;
                }
                if(this.isSpell(card)) {
                    tmp.spell += card.number;
                    detailsResults.cards.spell += card.number;
                }
                if(this.isEnchant(card)) {
                    tmp.enchant += card.number;
                    detailsResults.cards.enchant += card.number;
                }
                if(this.isLand(card)) {
                    detailsResults.cards.land += card.number;
                }
            }

            if(tmp.spell > 0 || tmp.creature > 0 || tmp.enchant >0) {
                chartResults.push(tmp);
            }
        }
        deck.side.forEach((card) => {
            if(this.isCreature(card)) {
                detailsResults.side.creature += card.number;
            }
            if(this.isSpell(card)) {
                detailsResults.side.spell += card.number;
            }
            if(this.isEnchant(card)) {
                detailsResults.side.enchant += card.number;
            }
            if(this.isLand(card)) {
                detailsResults.side.land += card.number;
            }
        });
        return [chartResults, detailsResults];
    }

    static getTypeCard(card: CardModel) {
        if(this.isLand(card)) return ''
    }

    static isLand(card: CardModel) {
        return card.type_line.toLowerCase().indexOf('land') > -1;
    }

    static isCreature(card: CardModel) {
        return (
            card.type_line.toLowerCase().indexOf('creature') > -1
        );
    }

    static isSpell(card: CardModel) {
        return (
            card.type_line.toLowerCase().indexOf('instant') > -1 ||
            card.type_line.toLowerCase().indexOf('sorcery') > -1 ||
            card.type_line.toLowerCase().indexOf('tribal') > -1 ||
            card.type_line.toLowerCase().indexOf('emblem') > -1
        );
    }

    static isEnchant(card: CardModel) {
        return (
            card.type_line.toLowerCase().indexOf('enchantment') > -1
        );
    }
}
