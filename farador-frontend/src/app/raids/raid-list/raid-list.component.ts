import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaidService } from '../../services/raid.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { io, Socket } from 'socket.io-client';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { UserService } from '../../services/user.service';
import { Raid } from '../../models/raid';
import { User } from '../../models/user';
import { ToastModule } from 'primeng/toast';
import { jwtDecode } from 'jwt-decode';
import {LoginModalComponent} from "../../auth/login-modal.component";
import {Router} from "@angular/router";

@Component({
    selector: 'app-raid-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TooltipModule, TableModule, DropdownModule, ToastModule, LoginModalComponent],
    templateUrl: './raid-list.component.html',
    styleUrls: ['./raid-list.component.scss']
})
export class RaidListComponent implements OnInit, OnDestroy {
    raids: Raid[] = [];
    users: User[] = [];
    isLoggedIn: boolean = false;
    username: string | null = null;
    selectedBoss: any = null;
    showLoginModal: boolean = true;
    raidGroups: { groupId: number; raids: Raid[]; bosses: any[] }[] = [];
    selectedGroup: { groupId: number; raids: Raid[]; bosses: any[] } | null = null;
    @ViewChild('lootList') lootList!: ElementRef;
    @Output() raidCreated = new EventEmitter<void>();
    private socket: Socket;

    constructor(
        private raidService: RaidService,
        private authService: AuthService,
        private messageService: MessageService,
        private userService: UserService,
        private cdr: ChangeDetectorRef,
        private router: Router,
    ) {
        this.socket = io('http://localhost:3000', { reconnection: true, reconnectionAttempts: 5 });
    }

    ngOnInit() {
        this.authService.isLoggedIn.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;
            this.username = this.authService.getCurrentUser();
            if (isLoggedIn) {
                this.loadRaids();
                this.loadUsers();
            } else {
                this.raids = [];
                this.raidGroups = [];
                this.selectedGroup = null;
                this.selectedBoss = null;
                this.messageService.add({ severity: 'warn', summary: 'Connexion requise', detail: 'Veuillez vous connecter pour voir les raids.', life: 5000 });
                this.authService.showLoginModal();
                this.cdr.detectChanges();
            }
        });
        this.setupSocketListeners();
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }

    loadRaids() {
        if (!this.getCurrentUser()) {
            console.log('Utilisateur non connecté, chargement des raids annulé.');
            this.raids = [];
            this.raidGroups = [];
            return;
        }
        this.raidService.getRaids().subscribe({
            next: (raids) => {
                this.raids = raids.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                this.groupRaidsByGroupId();
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des raids', life: 5000 });
            }
        });
    }

    groupRaidsByGroupId() {
        const groupsMap = new Map<number, { raids: Raid[]; bosses: any[] }>();
        this.raids.forEach(raid => {
            const groupId = raid.groupId;
            if (!groupsMap.has(groupId)) {
                groupsMap.set(groupId, { raids: [], bosses: raid.bosses || [] });
            }
            groupsMap.get(groupId)!.raids.push(raid);
        });
        this.raidGroups = Array.from(groupsMap.entries()).map(([groupId, data]) => ({
            groupId,
            raids: data.raids.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            bosses: data.bosses
        })).sort((a, b) => b.groupId - a.groupId);
    }

    loadUsers() {
        console.log('Chargement des utilisateurs...');
        this.userService.getUsers().subscribe({
            next: (users: User[]) => {
                console.log('✅ Utilisateurs chargés :', JSON.stringify(users, null, 2));
                this.users = users;
            },
            error: (err: any) => {
                console.error('Erreur lors du chargement des utilisateurs :', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des utilisateurs', life: 5000 });
                this.users = [];
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('connect_error', (err) => {
            console.error('Erreur de connexion WebSocket :', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur WebSocket', detail: 'Impossible de se connecter au serveur', life: 5000 });
        });

        this.socket.on('raidUpdated', (updatedRaid: Raid) => {
            console.log('📡 Raid mis à jour via WebSocket :', JSON.stringify(updatedRaid, null, 2));
            const index = this.raids.findIndex(r => r._id === updatedRaid._id);
            if (index !== -1) {
                this.raids[index] = updatedRaid;
                this.groupRaidsByGroupId();
                if (this.selectedGroup && this.selectedGroup.groupId === updatedRaid.groupId) {
                    this.selectedGroup = this.raidGroups.find(g => g.groupId === updatedRaid.groupId) || null;
                    if (this.selectedBoss) {
                        this.selectedBoss = this.selectedGroup?.bosses.find(b => b.name === this.selectedBoss.name) || null;
                    }
                }
                this.cdr.detectChanges();
            }
        });
    }

    openGroupDetails(group: { groupId: number; raids: Raid[]; bosses: any[] }) {
        this.selectedGroup = { ...group };
        this.selectedBoss = group.bosses[0] || null;
        this.scrollToTop();
    }

    closeGroupDetails() {
        this.selectedGroup = null;
        this.selectedBoss = null;
    }

    selectBoss(boss: any) {
        this.selectedBoss = boss;
        this.scrollToTop();
    }

    addReservation(bossName: string, lootId: string) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté', life: 5000 });
            return;
        }
        if (!this.selectedGroup) {
            console.log('Aucun groupe sélectionné', { selectedGroup: this.selectedGroup });
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun groupe sélectionné', life: 5000 });
            return;
        }
        console.log('Appel de reserveLootInGroup pour ajout', { groupId: this.selectedGroup.groupId, bossName, lootId, user: currentUser });
        this.raidService.reserveLootInGroup(this.selectedGroup.groupId, bossName, lootId, currentUser, true).subscribe({
            next: () => {
                console.log('Réservation ajoutée avec succès');
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Réservation ajoutée', life: 5000 });
            },
            error: (err: any) => {
                console.error('Erreur lors de l’ajout de la réservation :', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Échec de l’ajout de la réservation', life: 5000 });
            }
        });
    }

    removeReservation(bossName: string, lootId: string) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté', life: 5000 });
            return;
        }
        if (!this.selectedGroup) {
            console.log('Aucun groupe sélectionné', { selectedGroup: this.selectedGroup });
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun groupe sélectionné', life: 5000 });
            return;
        }
        console.log('Appel de reserveLootInGroup pour suppression', { groupId: this.selectedGroup.groupId, bossName, lootId, user: currentUser });
        this.raidService.reserveLootInGroup(this.selectedGroup.groupId, bossName, lootId, currentUser, false).subscribe({
            next: () => {
                console.log('Réservation supprimée avec succès');
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Réservation supprimée', life: 5000 });
            },
            error: (err: any) => {
                console.error('Erreur lors de l’annulation de la réservation :', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Échec de la suppression de la réservation', life: 5000 });
            }
        });
    }

    updateDrop(bossName: string, lootId: string, selectedUser: string | null | undefined) {
        console.log('updateDrop appelé avec selectedUser :', selectedUser);
        if (!selectedUser && selectedUser !== null) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun utilisateur sélectionné pour le drop', life: 5000 });
            return;
        }
        if (!this.selectedGroup || !this.selectedGroup.raids[0]._id) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID du raid manquant ou groupe non sélectionné', life: 5000 });
            return;
        }
        this.raidService.updateDrop(this.selectedGroup.raids[0]._id, bossName, lootId, selectedUser).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Drop mis à jour', detail: 'Drop assigné', life: 5000 });
            },
            error: (err: any) => {
                console.error('Erreur lors de la mise à jour du drop :', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec update drop', life: 5000 });
            }
        });
    }

    autoReserveForNewGroup(previousGroups: { groupId: number; raids: Raid[] }[], newGroupId: number) {
        const latestGroup = previousGroups[0];
        if (!latestGroup) return;

        latestGroup.raids.forEach((raid: Raid) => {
            raid.bosses?.forEach((boss: any) => {
                boss.loots?.forEach((loot: any) => {
                    loot.softReservedBy?.forEach((user: string) => {
                        if (!loot.droppedTo) {
                            this.raidService.reserveLootInGroup(newGroupId, boss.name, loot.itemId, user, true).subscribe({
                                next: () => {
                                    console.log(`Réservation auto pour ${user} sur item ${loot.itemName} dans le groupe ${newGroupId}`);
                                },
                                error: (err: any) => {
                                    console.error('Erreur lors de la réservation auto :', err);
                                }
                            });
                        }
                    });
                });
            });
        });
    }

    isAdmin(): boolean {
        const token = this.authService.getToken();
        if (token) {
            try {
                const decoded: User = jwtDecode(token);
                return decoded.role === 'admin';
            } catch (error) {
                console.error('Erreur lors du décodage du token :', error);
                return false;
            }
        }
        return false;
    }

    openLoginModal() {
        this.authService.showLoginModal();
    }

    getCurrentUser(): string | null {
        return this.authService.getCurrentUser();
    }

    private scrollToTop() {
        this.lootList?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    public onLoginModalClose() {
        try {
            const token = this.authService.getToken();
            this.isLoggedIn = !!token && !!this.authService.getCurrentUser();
            this.username = this.authService.getCurrentUser();
            if (this.isLoggedIn && (this.router.url === '/' || this.router.url === '')) {
                this.router.navigate(['/raids']).catch(err => {
                    console.error('Erreur lors de la navigation vers /raids :', JSON.stringify(err, null, 2));
                });
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'état de connexion :', error);
            this.showLoginModal = false;
            this.authService.logout();
        }
        this.showLoginModal = false;
    }
}