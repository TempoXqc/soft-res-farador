// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser: string | null = null;
    private token: string | null = null;

    constructor(private http: HttpClient) {
        // Vérifie si un token existe dans localStorage au démarrage
        this.token = localStorage.getItem('token');
        if (this.token) {
            try {
                const decoded = this.decodeToken(this.token);
                this.currentUser = decoded.username;
            } catch (error) {
                console.error('Erreur lors du décodage du token au démarrage :', error);
                this.logout();
            }
        }
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post('/api/auth/login', { username, password }).pipe(
            tap((response: any) => {
                this.token = response.token;
                this.currentUser = username;
                localStorage.setItem('token', this.token);
            })
        );
    }

    getCurrentUser(): string | null {
        return this.currentUser;
    }

    getToken(): string | null {
        return this.token || localStorage.getItem('token');
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('token');
    }

    private decodeToken(token: string): any {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            throw new Error('Token invalide');
        }
    }
}