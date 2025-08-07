import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Raid } from '../models/raid';

@Injectable({
    providedIn: 'root'
})
export class RaidService {
    private apiUrl = 'http://localhost:3000/api/raids';

    constructor(private http: HttpClient) {}

    getRaids(): Observable<Raid[]> {
        console.log('Appel de getRaids à :', this.apiUrl);
        return this.http.get<Raid[]>(this.apiUrl);
    }

    createRaid(raidData: any): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.post(this.apiUrl, raidData, { headers });
    }

    reserveLootInGroup(groupId: number, bossName: string, itemId: string, user: string, reserve: boolean): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de reserveLootInGroup avec headers :', headers);
        return this.http.put(`${this.apiUrl}/group/${groupId}/reserve`, { bossName, itemId, username: user, add: reserve }, { headers });
    }

    updateDrop(raidId: string, bossName: string, lootId: string, selectedUser: string | null): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de updateDrop avec headers :', headers);
        return this.http.post(`${this.apiUrl}/${raidId}/bosses/${bossName}/loots/${lootId}/drop`, { droppedTo: selectedUser }, { headers });
    }
}