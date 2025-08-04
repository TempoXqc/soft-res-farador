import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RaidService } from '../raid.service';

@Component({
    selector: 'app-raid-detail',
    templateUrl: './raid-detail.component.html',
    styleUrls: ['./raid-detail.component.css']
})
export class RaidDetailComponent implements OnInit {
    raid: any;
    bosses: any[] = [];
    selectedBoss: number | null = null;
    difficulty: string = 'normal';
    loots: any[] = [];

    constructor(private route: ActivatedRoute, private raidService: RaidService) {}

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.raidService.getRaid(id).subscribe(raid => this.raid = raid);
            this.raidService.getBosses().subscribe(bosses => this.bosses = bosses);
        }
    }

    filterDifficulty(diff: string) {
        this.difficulty = diff;
        this.loadLoots();
    }

    selectBoss(bossId: number) {
        this.selectedBoss = bossId;
        this.loadLoots();
    }

    loadLoots() {
        this.raidService.getLoots(this.selectedBoss ?? undefined, this.difficulty).subscribe(loots => this.loots = loots);
    }

    reserve(itemId: number) {
        if (this.raid.locked) return alert('Raid locked');
        this.raidService.reserve(this.raid._id, itemId).subscribe(() => {
            this.raidService.getRaid(this.raid._id).subscribe(raid => this.raid = raid);
        });
    }
}