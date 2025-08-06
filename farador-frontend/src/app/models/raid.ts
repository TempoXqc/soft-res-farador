export interface Raid {
    _id?: string;
    name: string;
    date: string;
    difficulty: 'Normal' | 'Heroic' | 'Mythic';
    bosses: Boss[];
}

export interface Boss {
    name: string;
    loots: Loot[];
}

export interface Loot {
    itemId: string;
    itemName: string;
    slot: string;
    softReservedBy: string[];
}
