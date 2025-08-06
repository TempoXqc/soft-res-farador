import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlizzardService {
    private clientId = 'TON_CLIENT_ID';
    private clientSecret = 'TON_CLIENT_SECRET';
    private token: string | null = null;

    constructor(private http: HttpClient) {}

    async getAccessToken(): Promise<string> {
        if (this.token) return this.token;

        const body = new URLSearchParams();
        body.set('grant_type', 'client_credentials');

        const tokenResponse: any = await lastValueFrom(
            this.http.post('https://oauth.battle.net/token', body, {
                headers: {
                    Authorization: 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
        );

        this.token = tokenResponse.access_token;
        return this.token ?? '';
    }

    async getItemMedia(itemId: number): Promise<string> {
        const token = await this.getAccessToken();

        const response: any = await lastValueFrom(
            this.http.get(`https://eu.api.blizzard.com/data/wow/media/item/${itemId}`, {
                params: {
                    namespace: 'static-eu',
                    locale: 'fr_FR',
                    access_token: token,
                },
            })
        );

        return response.assets?.[0]?.value ?? '';
    }
}
