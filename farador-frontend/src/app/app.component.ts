import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'farador-softres';
    showLoginModal = false;

    constructor(public authService: AuthService, private messageService: MessageService) {}

    logout() {
        this.authService.logout();
        this.messageService.add({ severity: 'success', summary: 'Déconnexion', detail: 'Déconnexion réussie' });
    }
}