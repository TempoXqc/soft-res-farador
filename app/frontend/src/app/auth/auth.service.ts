import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from "../../environment/environments";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;
    private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));

    constructor(private http: HttpClient) {}

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, data);
    }

    login(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, data);
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
        this.tokenSubject.next(token);
    }

    getToken(): string | null {
        return this.tokenSubject.value;
    }

    logout() {
        localStorage.removeItem('token');
        this.tokenSubject.next(null);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}