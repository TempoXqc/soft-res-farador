// src/app/services/raid.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Raid} from "../models/raid";

@Injectable({
    providedIn: 'root'
})
export class RaidService {
    private apiUrl = '/api/raids';

    constructor(private http: HttpClient) {}

    getRaids(): Observable<Raid[]> {
        return this.http.get<Raid[]>(this.apiUrl);
    }
}
