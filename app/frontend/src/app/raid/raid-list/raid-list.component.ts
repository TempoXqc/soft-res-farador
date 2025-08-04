import { Component, OnInit } from '@angular/core';
import { RaidService } from '../raid.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-raid-list',
    templateUrl: './raid-list.component.html',
    styleUrls: ['./raid-list.component.css']
})
export class RaidListComponent implements OnInit {
    raids: any[] = [];
    newDate: string = '';

    constructor(private raidService: RaidService, private router: Router) {}

    ngOnInit() {
        this.raidService.getRaids().subscribe(raids => this.raids = raids);
    }

    createNew() {
        this.raidService.createRaid(this.newDate).subscribe(raid => {
            this.raids.push(raid);
            this.newDate = '';
        });
    }

    viewRaid(id: string) {
        this.router.navigate(['/raids', id]);
    }
}