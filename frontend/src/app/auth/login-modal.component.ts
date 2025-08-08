import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-login-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, ToastModule],
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
                this.messageService.add({ severity: 'success', summary: 'Connecté', detail: `Bienvenue ${this.username}` });
                this.closeModal();
                this.authService.isLoggedInSubject.next(true);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Identifiant ou mot de passe incorrect' });
            }
        });
    }

    closeModal() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.username = '';
        this.password = '';
    }
}