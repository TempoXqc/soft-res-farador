import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { LoginModalComponent } from "./auth/login-modal.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, LoginModalComponent],
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
        private renderer: Renderer2
    ) {}

    ngOnInit() {
        console.log('AppComponent initialisé, showLoginModal :', this.showLoginModal);
        this.checkLoginStatus();
        this.setupDocumentClickListener();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            console.log('Navigation terminée, URL actuelle :', this.router.url);
            this.checkLoginStatus();
        });
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }

    checkLoginStatus() {
        try {
            this.isLoggedIn = !!this.authService.getCurrentUser();
            this.username = this.authService.getCurrentUser();
            console.log('État de connexion :', JSON.stringify({ isLoggedIn: this.isLoggedIn, username: this.username }, null, 2));
            if (this.isLoggedIn && (this.router.url === '/' || this.router.url === '')) {
                console.log('Utilisateur connecté, tentative de redirection vers /raids');
                this.router.navigate(['/raids']).catch(err => {
                    console.error('Erreur lors de la navigation vers /raids :', JSON.stringify(err, null, 2));
                });
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'état de connexion :', error);
            this.isLoggedIn = false;
            this.username = null;
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

    logout() {
        try {
            console.log('Tentative de déconnexion');
            this.authService.logout();
            this.isLoggedIn = false;
            this.username = null;
            this.showDropdown = false;
            console.log('Déconnexion réussie');
            this.router.navigate(['/']);
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
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

    logLoginClick() {
        console.log('Clic sur le bouton Connexion, ouverture de la modale, showLoginModal :', true);
        this.showLoginModal = true;
    }

    onLoginModalClose() {
        console.log('Modale de connexion fermée, showLoginModal :', false);
        this.showLoginModal = false;
        this.checkLoginStatus();
    }
}