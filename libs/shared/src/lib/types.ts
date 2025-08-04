export interface User {
    _id: string;
    charName: string;
    server: string;
    passwordHash: string;
    characterData: any;
}

export interface Item {
    itemId: number;
    name: string;
    bossId: number;
    difficulty: 'normal' | 'heroic' | 'mythic';
    wowData: any;
}

export interface Raid {
    _id: string;
    date: Date;
    reservations: { userId: string; itemId: number }[];
}