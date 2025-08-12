import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-login-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        ProgressSpinnerModule
    ],
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    username = '';
    password = '';
    loading = false;
    errorMessage: string | null = null;

    constructor(private authService: AuthService, private messageService: MessageService) {}

    login() {
        this.loading = true;
        this.errorMessage = null;

        this.authService.login(this.username, this.password).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Connecté', detail: `Bienvenue ${this.username}` });
                this.closeModal();
                this.authService.isLoggedInSubject.next(true);
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                if (err.status === 401 && err.error?.error?.code === 'invalidUsername') {
                    this.errorMessage = 'invalidUsername';
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Nom d\'utilisateur incorrect' });
                } else if (err.status === 401 && err.error?.error?.code === 'invalidPassword') {
                    this.errorMessage = 'invalidPassword';
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Mot de passe incorrect' });
                } else {
                    this.errorMessage = 'genericError';
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur inattendue est survenue' });
                }
            }
        });
    }

    closeModal() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.username = '';
        this.password = '';
        this.errorMessage = null;
        this.loading = false;
    }
}