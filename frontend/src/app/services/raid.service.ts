import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { History, Raid } from '../models/raid';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class RaidService {
    private apiUrl = `${environment.apiUrl}/raids`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    getRaids(): Observable<Raid[]> {
        const token = this.authService.getToken();
        if (!token) {
            return of([]);
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<Raid[]>(this.apiUrl, { headers }).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    console.warn('Utilisateur non connecté, pas de chargement des raids');
                    return of([]);
                }
                console.error('Erreur lors de getRaids :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }

    createRaid(raidData: any): Observable<any> {
        const token = this.authService.getToken();
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.post(this.apiUrl, raidData, { headers });
    }

    reserveLootInGroup(groupId: number, bossName: string, itemId: string, user: string, reserve: boolean): Observable<any> {
        const token = this.authService.getToken();
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.put(`${this.apiUrl}/group/${groupId}/reserve`, { bossName, itemId, username: user, add: reserve }, { headers });
    }

    updateDrop(groupId: number, bossName: string, itemId: string, droppedTo: string[]): Observable<any> {
        const token = this.authService.getToken();
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.put(`${this.apiUrl}/group/${groupId}/drop`, { bossName, itemId, droppedTo }, { headers }).pipe(
            catchError((error) => {
                console.error('Erreur lors de updateDrop :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }

    updateReserved(groupId: number, bossName: string, itemId: string, softReservedBy: string[]): Observable<any> {
        const token = this.authService.getToken();
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        return this.http.put(`${this.apiUrl}/group/${groupId}/reserved`, { bossName, itemId, softReservedBy }, { headers }).pipe(
            catchError((error) => {
                console.error('Erreur lors de updateReserved :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }

    getReservationHistory(groupId: number, bossName?: string, itemId?: string): Observable<History[]> {
        const token = this.authService.getToken();
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        let params = new HttpParams();
        if (bossName) {
            params = params.set('bossName', bossName);
        }
        if (itemId) {
            params = params.set('itemId', itemId);
        }
        return this.http.get<History[]>(`${this.apiUrl}/group/${groupId}/history`, { headers, params }).pipe(
            catchError((error) => {
                console.error('Erreur lors de getReservationHistory :', JSON.stringify(error, null, 2));
                throw error;
            })
        );
    }
}