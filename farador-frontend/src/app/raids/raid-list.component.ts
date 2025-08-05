import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {TableModule} from "primeng/table";

@Component({
    selector: 'app-raid-list',
    imports: [
        TableModule
    ],
    template: `
        <div class="p-m-3">
            <h2>Raids précédents</h2>
            <p-table [value]="raids">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-raid>
                    <tr>
                        <td>{{ raid.date }}</td>
                        <td>
                            <button pButton icon="pi pi-eye" label="Voir" [routerLink]="['/raid', raid._id]"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class RaidListComponent implements OnInit {
    raids: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get<any[]>('http://localhost:3000/api/raids').subscribe(data => this.raids = data);
    }
}
