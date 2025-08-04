import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CharacterService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient, private authService: AuthService) {}

    getMyCharacter(): Observable<any> {
        const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
        return this.http.get(`${this.apiUrl}/characters/me`, { headers });
    }
}