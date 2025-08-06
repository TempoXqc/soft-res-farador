import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import {DialogModule} from "primeng/dialog";

@Component({
    selector: 'app-login-modal',
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.scss']
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