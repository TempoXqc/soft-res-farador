import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) {}

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getCurrentUser(): Observable<User> {
        const token = localStorage.getItem('token');
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
        console.log('Appel de getCurrentUser avec headers :', headers?.get('Authorization') || 'Aucun token');
        return this.http.get<User>(`${this.apiUrl}/me`, { headers });
    }
}