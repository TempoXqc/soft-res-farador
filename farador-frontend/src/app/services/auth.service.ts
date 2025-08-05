import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    getToken() {
        return localStorage.getItem('token');
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    logout() {
        localStorage.removeItem('token');
    }
}
