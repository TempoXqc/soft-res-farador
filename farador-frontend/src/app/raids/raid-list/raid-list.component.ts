import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RaidService } from "../../services/raid.service";

@Component({
    selector: 'app-raid-list',
    templateUrl: './raid-list.component.html',
    styleUrls: ['./raid-list.component.scss'],
})
export class RaidListComponent implements OnInit {
    raids: any[] = [];
    showModal = false;
    selectedRaid: any = null;
    selectedBoss: any = null;
    @ViewChild('lootList') lootList!: ElementRef;

    constructor(private raidService: RaidService) {}

    ngOnInit() {
        this.raidService.getRaids().subscribe((raids) => {
            console.log('✅ Raids chargés depuis l’API :', raids);
            this.raids = raids;
        });
    }

    openModal(raid: any) {
        this.selectedRaid = raid;
        this.selectedBoss = raid.bosses?.[0] ?? null;
        this.showModal = true;
        this.scrollToTop();
    }

    selectBoss(boss: any) {
        this.selectedBoss = boss;
        this.scrollToTop();
    }

    closeModal() {
        this.showModal = false;
        this.selectedRaid = null;
        this.selectedBoss = null;
    }

    scrollToTop() {
        if (this.lootList) {
            this.lootList.nativeElement.scrollTop = 0;
        }
    }

    getGroupedLoots(): { slot: string, items: any[] }[] {
        if (!this.selectedBoss || !this.selectedBoss.loots) {
            return [];
        }

        // Group loots by slot
        const grouped = this.selectedBoss.loots.reduce((acc: any, loot: any) => {
            const slot = loot.slot || 'Unknown';
            if (!acc[slot]) {
                acc[slot] = [];
            }
            acc[slot].push(loot);
            return acc;
        }, {});

        // Convert to array, sort slots, and sort items within each slot by itemName
        return Object.keys(grouped)
            .sort((a, b) => a.localeCompare(b)) // Sort slots alphabetically
            .map(slot => ({
                slot,
                items: grouped[slot].sort((a: any, b: any) =>
                    a.itemName.localeCompare(b.itemName) // Sort items by name
                )
            }));
    }

    getLootDataWowhead(loot: any): string {
        let data = `item=${loot.itemId}`;
        let bonus = loot.difficultyBonus || '';
        if (loot.bonusIds) {
            const bonusStr = Array.isArray(loot.bonusIds) ? loot.bonusIds.join(':') : loot.bonusIds;
            bonus += (bonus ? ':' : '') + bonusStr;
        }
        if (bonus) {
            data += `&bonus=${bonus}`;
        }
        return data;
    }
}