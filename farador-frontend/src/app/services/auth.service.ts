import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
    isLoggedIn = this.isLoggedInSubject.asObservable();

    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>('http://localhost:3000/api/auth/login', {
            username,
            password
        }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                this.isLoggedInSubject.next(true);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.isLoggedInSubject.next(false);
    }
}