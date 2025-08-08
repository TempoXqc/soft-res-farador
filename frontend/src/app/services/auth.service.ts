import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    username: string;
    role: string;
    class: string;
    armoryUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
    isLoggedIn = this.isLoggedInSubject.asObservable();
    private loginModalSubject = new BehaviorSubject<boolean>(false);
    loginModalState$ = this.loginModalSubject.asObservable();

    constructor(private http: HttpClient) {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: JwtPayload = jwtDecode(token);
                this.isLoggedInSubject.next(true);
            } catch (error) {
                console.error('Erreur lors du décodage du token au démarrage :', error);
                this.logout();
            }
        }
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>('http://localhost:3000/api/auth/login', {
            username,
            password
        }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                this.isLoggedInSubject.next(true);
                this.hideLoginModal();
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.isLoggedInSubject.next(false);
    }

    getCurrentUser(): string | null {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: JwtPayload = jwtDecode(token);
                return decoded.username;
            } catch (error) {
                console.error('Error decoding JWT:', error);
                return null;
            }
        }
        return null;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    showLoginModal() {
        this.loginModalSubject.next(true);
    }

    hideLoginModal() {
        this.loginModalSubject.next(false);
    }
}