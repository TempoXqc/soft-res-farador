import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-loot-table',
    templateUrl: './loot-table.component.html',
    styleUrls: ['./loot-table.component.css']
})
export class LootTableComponent {
    @Input() loots: any[] = [];
    @Input() reservations: any[] = [];
    @Input() locked: boolean = false;
    @Output() reserve = new EventEmitter<number>();

    getReservedBy(itemId: number): string[] {
        return this.reservations.filter(r => r.itemId === itemId).map(r => r.userId.charName);
    }

    onReserve(itemId: number) {
        this.reserve.emit(itemId);
    }
}