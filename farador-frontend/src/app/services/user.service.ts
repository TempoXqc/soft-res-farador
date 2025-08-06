import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUser = {
        charname: 'Nathan' // à adapter dynamiquement plus tard
    };

    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(charname: string) {
        this.currentUser.charname = charname;
    }
}
