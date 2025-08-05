import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import {Dialog} from "primeng/dialog";

@Component({
    selector: 'app-login-modal',
    imports: [
        Dialog
    ],
    template: `
        <p-dialog header="Connexion" [(visible)]="display">
            <div class="p-fluid">
                <label for="username">Nom du personnage</label>
                <input id="username" type="text" pInputText [(ngModel)]="username">

                <label for="password">Mot de passe</label>
                <input id="password" type="password" pInputText [(ngModel)]="password">
            </div>
            <p-footer>
                <button pButton label="Se connecter" (click)="login()"></button>
            </p-footer>
        </p-dialog>
    `
})
export class LoginModalComponent {
    display = true;
    username = '';
    password = '';

    constructor(private http: HttpClient, private messageService: MessageService) {}

    login() {
        this.http.post<any>('http://localhost:3000/api/auth/login', {
            username: this.username,
            password: this.password
        }).subscribe({
            next: (res) => {
                localStorage.setItem('token', res.token);
                this.display = false;
                this.messageService.add({severity:'success', summary:'Connecté', detail:'Bienvenue ' + this.username});
            },
            error: () => this.messageService.add({severity:'error', summary:'Erreur', detail:'Connexion échouée'})
        });
    }
}