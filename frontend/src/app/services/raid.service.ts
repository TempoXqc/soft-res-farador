import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Raid } from '../models/raid';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class RaidService {
    private apiUrl = `${environment.apiUrl}/raids`;

    constructor(private http: HttpClient) {}

    getRaids(): Observable<Raid[]> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
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
        return this.http.post(this.apiUrl, raidData, { headers });
    }

    reserveLootInGroup(groupId: number, bossName: string, itemId: string, user: string, reserve: boolean): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.put(`${this.apiUrl}/group/${groupId}/reserve`, { bossName, itemId, username: user, add: reserve }, { headers });
    }

    updateDrop(groupId: number, bossName: string, itemId: string, droppedTo: string[]): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.put(`${this.apiUrl}/group/${groupId}/drop`, { bossName, itemId, droppedTo }, { headers }).pipe(
            catchError((error) => {
                console.error('Erreur lors de updateDrop :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }

    updateReserved(groupId: number, bossName: string, itemId: string, softReservedBy: string[]): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.put(`${this.apiUrl}/group/${groupId}/reserved`, { bossName, itemId, softReservedBy }, { headers }).pipe(
            catchError((error) => {
                console.error('Erreur lors de updateReserved :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }
}