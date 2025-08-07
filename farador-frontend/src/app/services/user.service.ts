import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient) {}

    getUsers(): Observable<User[]> {
        console.log('Appel de getUsers à :', this.apiUrl); // Debug
        return this.http.get<User[]>(this.apiUrl);
    }
}