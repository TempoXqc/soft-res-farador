import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import {jwtDecode, JwtPayload} from "jwt-decode";
import {User} from "./models/user";
import {UserService} from "./services/user.service";

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
    userUrls: { url_armory: string; url_bis: string; url_io: string } = {
        url_armory: 'https://worldofwarcraft.com/en-us/character',
        url_bis: 'https://www.wowhead.com/bis',
        url_io: 'https://raider.io'
    };
    showDropdown: boolean = false;
    showLoginModal: boolean = false;
    private documentClickListener: (() => void) | null = null;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.authService.isLoggedIn.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;
            this.username = this.authService.getCurrentUser();
            if (isLoggedIn) {
                this.userService.getCurrentUser().subscribe({
                    next: (user: User) => {
                        this.userUrls = {
                            url_armory: user.url_armory || 'https://worldofwarcraft.com/en-us/character',
                            url_bis: user.url_bis || 'https://www.wowhead.com/bis',
                            url_io: user.url_io || 'https://raider.io'
                        };
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Erreur lors de la récupération des données utilisateur :', JSON.stringify(err, null, 2));
                    }
                });
            } else {
                this.userUrls = {
                    url_armory: 'https://worldofwarcraft.com/en-us/character',
                    url_bis: 'https://www.wowhead.com/bis',
                    url_io: 'https://raider.io'
                };
            }
            if (isLoggedIn && (this.router.url === '/' || this.router.url === '')) {
                this.router.navigate(['/raids']).catch(err => {
                    console.error('Erreur lors de la navigation vers /raids :', JSON.stringify(err, null, 2));
                });
            } else if (!isLoggedIn && this.router.url.includes('/raids')) {
                this.authService.showLoginModal();
            }
            this.cdr.detectChanges();
        });
        this.authService.loginModalState$.subscribe(state => {
            this.showLoginModal = state;
        });
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
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
            this.authService.logout();
            this.isLoggedIn = false;
            this.username = null;
            this.showDropdown = false;
            this.userUrls = {
                url_armory: 'https://worldofwarcraft.com/en-us/character',
                url_bis: 'https://www.wowhead.com/bis',
                url_io: 'https://raider.io'
            };
            this.router.navigate(['/']).then(() => {
                this.authService.showLoginModal();
            });
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    setupDocumentClickListener() {
        this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const clickedInsideMenu = target.closest('.user-profile') || target.closest('.dropdown-menu');
            if (!clickedInsideMenu && this.showDropdown) {
                this.showDropdown = false;
            }
        });
    }

    navigateToBisLoot() {
        window.open(this.userUrls.url_bis, '_blank');
    }

    navigateToWowArmory() {
        window.open(this.userUrls.url_armory, '_blank');
    }

    navigateToRaiderIo() {
        window.open(this.userUrls.url_io, '_blank');
    }
}