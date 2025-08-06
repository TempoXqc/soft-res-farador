import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login-modal',
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    username = '';
    password = '';

    constructor(private authService: AuthService, private messageService: MessageService) {}

    login() {
        this.authService.login(this.username, this.password).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Connecté', detail: 'Bienvenue ' + this.username });
                this.closeModal();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Identifiant ou mot de passe incorrect' })
        });
    }

    closeModal() {
        this.visible = false;
        this.visibleChange.emit(false);
    }
}