import * as localForage from "localforage";
import { extendPrototype } from 'localforage-startswith';

import { CardModel } from "../model/Card.model";

import DeckModel from "../model/Deck.model";
import LibraryModel from "../model/Library.model";
import Library from "../model/Library.model";

extendPrototype(localForage);

class Storage {
    static files = null;

    static saveCardToLibrary(card: CardModel): Promise<Library> {
        return this.getLibrary().then((library) => {
            if (library === null) {
                card.number = 1;
                library = {
                    cards: [card]
                }
                localForage.setItem('library', library);
            } else {
                let cardFound = false;
                library.cards.forEach(value => {
                    if(card.id === value.id) {
                        cardFound = true;
                        value.number++;
                    }
                })
                if(!cardFound) library.cards.push(card);
            }
            return library;
        });
    }

    static addDecktoCardLibrary(card: CardModel, deckName: string): Promise<Library> {
        return this.getLibrary().then((library:LibraryModel) => {
                let cardIndexFound = library.cards.map(c => c.id).indexOf(card.id);
                if(cardIndexFound > -1) {
                    let cardFound = library.cards[cardIndexFound];
                    let deckIndexFound = cardFound.used.map(c => c.deckname).indexOf(deckName);
                    if(deckIndexFound > -1) {
                        let deck = cardFound.used[deckIndexFound];
                        if (deck.used === undefined || deck.used === null) {
                            deck.used = 0;
                        }
                        deck.used++;
                    } else {
                        card.used = [
                            {deckname: deckName, used: 1}
                        ];
                    }
                } else {
                    card.used = [
                        {deckname: deckName, used: 1}
                    ];
                    library.cards.push(card);
                }
            return library;
        });
    }

    static saveCardToDeck(card: CardModel , deckName: any): Promise<DeckModel> {
        return new Promise<DeckModel>((resolve, reject) => {
            this.getDeck(deckName)
                .then((deck: DeckModel) => {
                    if (deck === null) {
                        reject('Deck not found');
                    }
                    deck?.cards.push(card);
                    resolve(deck);
                })
                .catch(reason => {
                    console.error(reason);
                    reject(reason);
                });
        });
    }

    static saveCardToSideDeck(card: CardModel , deckName: any): Promise<DeckModel> {
        return new Promise<DeckModel>((resolve, reject) => {
            this.getDeck(deckName)
            .then((deck: DeckModel) => {
                if (deck === null) {
                    reject('Deck not found');
                }
                if(deck.side === undefined) {
                    deck.side = [];
                }
                deck.side.push(card);
                resolve(deck);
            })
            .catch(reason => {
                console.error(reason);
                reject(reason);
            });
        });
    }

    static getDecks(): Promise<DeckModel[]> {
        return new Promise<DeckModel[]>((resolve, reject) => {
            localForage.startsWith('deck.')
            .then(keys => {
                let deckModels: DeckModel[] = [];
                Object.keys(keys).forEach(key => {
                    deckModels.push(keys[key]);
                });
                deckModels.sort((t1, t2) => {
                    const name1 = t1.name.toLowerCase();
                    const name2 = t2.name.toLowerCase();
                    if (name1 > name2) { return 1; }
                    if (name1 < name2) { return -1; }
                    return 0;
                });
                resolve(deckModels);
            }).catch(error => {
                reject(error);
            });
        });
    }

    static getDeck(deckName?: string): Promise<DeckModel> {
        return new Promise<DeckModel>((resolve, reject) => {
            localForage.getItem<DeckModel>('deck.' + deckName)
                .then((value => {
                    if(value === null) {
                        this.setDeck({name: deckName, cards: [], side: []} as DeckModel)
                            .then((deckSet) => {
                                resolve(deckSet)
                            });
                    } else {
                        resolve(value);
                    }
                }))
                .catch((error) => {
                    reject(error)
                });
        });
    }

    static getLibrary(): Promise<Library> {
        return new Promise<Library>((resolve, reject) => {
            localForage.getItem<Library>('library')
            .then((value => {
                if(value === null) {
                    this.setLibrary({cards: []} as LibraryModel)
                    .then((librarySet) => resolve(librarySet));
                } else {
                    resolve(value);
                }
            }))
            .catch((error) => {
                reject(error)
            })
        });
    }

    static getAll(): Promise<[Library, DeckModel[]]> {
        return Promise.all([
            Storage.getLibrary(),
            Storage.getDecks()
        ]);
    }

    static setLibrary(library: Library, callback?: ((err: any, value: Library | null) => void) | undefined): Promise<LibraryModel> {
        return localForage.setItem<Library>('library', library, callback);
    }

    static setDeck(deck: DeckModel, callback?: ((err: any, value: DeckModel | null) => void) | undefined): Promise<DeckModel> {
        return localForage.setItem('deck.' + deck.name, deck, callback);
    }
    static saveCardsDeck(deck: DeckModel, cards: CardModel[]): Promise<DeckModel> {
        return new Promise<DeckModel>((resolve, reject) => {
            this.getDeck(deck.name)
            .then((deck: DeckModel) => {
                if (deck === null) {
                    reject('Deck not found');
                }
                deck.cards = cards;
                this.setDeck(deck);
                resolve(deck);
            })
            .catch(reason => {
                console.error(reason);
                reject(reason);
            });
        });
    }
    static saveCardsSide(deck: DeckModel, cards: CardModel[]): Promise<DeckModel> {
        return new Promise<DeckModel>((resolve, reject) => {
            this.getDeck(deck.name)
            .then((deck: DeckModel) => {
                if (deck === null) {
                    reject('Deck not found');
                }
                deck.side = cards;
                this.setDeck(deck);
                resolve(deck);
            })
            .catch(reason => {
                console.error(reason);
                reject(reason);
            });
        });
    }

    static removeDeck(deckName: string): Promise<void> {
        return localForage.removeItem('deck.' + deckName);
    }
}

export default Storage;
