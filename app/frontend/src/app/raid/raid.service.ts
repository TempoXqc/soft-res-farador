import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import {environment} from "../../environment/environments";

@Injectable({ providedIn: 'root' })
export class RaidService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient, private authService: AuthService) {}

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
    }

    getRaids(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/raids`, { headers: this.getHeaders() });
    }

    createRaid(date: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/raids`, { date }, { headers: this.getHeaders() });
    }

    getRaid(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/raids/${id}`, { headers: this.getHeaders() });
    }

    getBosses(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bosses`, { headers: this.getHeaders() });
    }

    getLoots(bossId?: number, difficulty?: string): Observable<any[]> {
        let params = '';
        if (bossId) params += `bossId=${bossId}`;
        if (difficulty) params += `&difficulty=${difficulty}`;
        return this.http.get<any[]>(`${this.apiUrl}/loot?${params}`, { headers: this.getHeaders() });
    }

    reserve(raidId: string, itemId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/raids/${raidId}/reserve`, { itemId }, { headers: this.getHeaders() });
    }
}