import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Raid } from '../models/raid';

@Injectable({
    providedIn: 'root'
})
export class RaidService {
    private apiUrl = 'http://localhost:3000/api/raids';

    constructor(private http: HttpClient) {}

    getRaids(): Observable<Raid[]> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de getRaids avec headers :', headers?.get('Authorization') || 'Aucun token');
        return this.http.get<Raid[]>(this.apiUrl, { headers }).pipe(
            catchError((error) => {
                console.error('Erreur lors de getRaids :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }

    createRaid(raidData: any): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de createRaid avec headers :', headers);
        return this.http.post(this.apiUrl, raidData, { headers });
    }

    reserveLootInGroup(groupId: number, bossName: string, itemId: string, user: string, reserve: boolean): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de reserveLootInGroup avec headers :', headers);
        return this.http.put(`${this.apiUrl}/group/${groupId}/reserve`, { bossName, itemId, username: user, add: reserve }, { headers });
    }

    updateDrop(groupId: number, bossName: string, itemId: string, droppedTo: string[]): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de updateDrop avec headers :', headers, 'data :', { bossName, itemId, droppedTo });
        return this.http.put(`${this.apiUrl}/group/${groupId}/drop`, { bossName, itemId, droppedTo }, { headers }).pipe(
            catchError((error) => {
                console.error('Erreur lors de updateDrop :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }
}