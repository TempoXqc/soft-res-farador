import { Component } from '@angular/core';
import {Raid} from "../../models/raid";

@Component({
    selector: 'app-raid-reservation',
    templateUrl: './raid-reservation.component.html',
    styleUrls: ['./raid-reservation.component.scss']
})
export class RaidReservationComponent {
    reservations: string[] = [];
    selectedRaid: Raid | null = null;

    addReservation(name: string) {
        if (name) {
            this.reservations.push(name);
        }
    }
}
