export interface History {
    action: 'add' | 'remove';
    username: string;
    timestamp: string;
    bossName: string;
    itemId: string;
}

export interface Raid {
    _id?: string;
    name: string;
    date: string;
    difficulty: 'Normal' | 'Heroic' | 'Mythic';
    groupId: number;
    bosses: Boss[];
    history?: History[];
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
