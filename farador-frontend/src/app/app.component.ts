import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, DialogModule, InputTextModule, ReactiveFormsModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    isLoggedIn: boolean = false;
    username: string | null = null;
    showDropdown: boolean = false;
    showLoginModal: boolean = false;
    private documentClickListener: (() => void) | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        console.log('AppComponent initialisé, showLoginModal :', this.showLoginModal);
        this.authService.isLoggedIn.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;
            this.username = this.authService.getCurrentUser();
            console.log('État de connexion mis à jour :', isLoggedIn, 'Utilisateur :', this.username);
            if (isLoggedIn && (this.router.url === '/' || this.router.url === '')) {
                console.log('Redirection vers /raids après connexion');
                this.router.navigate(['/raids']).catch(err => {
                    console.error('Erreur lors de la navigation vers /raids :', JSON.stringify(err, null, 2));
                });
            } else if (!isLoggedIn && this.router.url.includes('/raids')) {
                // Ouvre la modale si l'utilisateur est déconnecté et sur une page protégée
                this.authService.showLoginModal();
            }
            this.cdr.detectChanges(); // Force la détection des changements
        });
        this.authService.loginModalState$.subscribe(state => {
            this.showLoginModal = state;
            console.log('État de la modale de connexion mis à jour :', state);
        });
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            console.log('Navigation terminée, URL actuelle :', this.router.url);
            if (!this.isLoggedIn && this.router.url.includes('/raids')) {
                this.authService.showLoginModal();
            }
        });
        this.setupDocumentClickListener();
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }

    logout() {
        try {
            console.log('Tentative de déconnexion');
            this.authService.logout();
            this.isLoggedIn = false;
            this.username = null;
            this.showDropdown = false;
            console.log('Déconnexion réussie');
            this.router.navigate(['/']).then(() => {
                this.authService.showLoginModal(); // Ouvre la modale après déconnexion
            });
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
        console.log('Menu déroulant toggled :', this.showDropdown);
    }

    setupDocumentClickListener() {
        this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const clickedInsideMenu = target.closest('.user-profile') || target.closest('.dropdown-menu');
            if (!clickedInsideMenu && this.showDropdown) {
                this.showDropdown = false;
                console.log('Menu fermé par clic à l\'extérieur');
            }
        });
    }

    navigateToBisLoot() {
        console.log('Navigation vers BIS Loot');
        window.open('https://www.wowhead.com/bis', '_blank');
    }

    navigateToWowArmory() {
        console.log('Navigation vers Wow Armory');
        window.open('https://worldofwarcraft.com/en-us/character', '_blank');
    }

    navigateToRaiderIo() {
        console.log('Navigation vers Raider.IO');
        window.open('https://raider.io', '_blank');
    }
}