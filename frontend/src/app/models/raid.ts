export interface Raid {
    _id?: string;
    name: string;
    date: string;
    difficulty: 'Normal' | 'Heroic' | 'Mythic';
    groupId: number;
    bosses: Boss[];
}

export interface Boss {
    name: string;
    loots: Loot[];
}

export interface Loot {
    id: string;
    itemId: string;
    itemName: string;
    slot: string;
    softReservedBy: string[];
    droppedTo?: string[];
}
