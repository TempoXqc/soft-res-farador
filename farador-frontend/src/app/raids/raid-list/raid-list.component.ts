import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
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
import {ToastModule} from "primeng/toast";

@Component({
    selector: 'app-raid-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TooltipModule, TableModule, DropdownModule, ToastModule],
    templateUrl: './raid-list.component.html',
    styleUrls: ['./raid-list.component.scss']
})
export class RaidListComponent implements OnInit, OnDestroy {
    raids: Raid[] = [];
    users: User[] = [];
    showModal = false;
    selectedRaid: Raid | null = null;
    selectedBoss: any = null;
    @ViewChild('lootList') lootList!: ElementRef;
    @Output() raidCreated = new EventEmitter<void>();
    private socket: Socket;


    constructor(
        private raidService: RaidService,
        private authService: AuthService,
        private messageService: MessageService,
        private userService: UserService
    ) {
        this.socket = io('http://localhost:3000', { reconnection: true, reconnectionAttempts: 5 });
    }

    ngOnInit() {
        const currentUser = this.authService.getCurrentUser();
        this.loadRaids();
        this.loadUsers();
        this.setupSocketListeners();
        this.loadWowheadTooltips();
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }

    loadRaids() {
        this.raidService.getRaids().subscribe({
            next: (raids) => {
                this.raids = raids.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            },
            error: (err: any) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des raids', life: 5000 });
            }
        });
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
                if (this.selectedRaid?._id === updatedRaid._id) {
                    this.selectedRaid = updatedRaid;
                    this.selectedBoss = updatedRaid.bosses.find((b: any) => b.name === this.selectedBoss?.name) || updatedRaid.bosses[0];
                }
                this.raids = [...this.raids.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())];
                console.log('Groupes après mise à jour :', JSON.stringify(this.getGroupedRaids(), null, 2));
            }
        });

        this.socket.on('raidCreated', (newRaid: Raid) => {
            console.log('📡 Nouveau raid créé via WebSocket :', JSON.stringify(newRaid, null, 2));
            this.raids = [newRaid, ...this.raids].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const previousGroups = this.getGroupedRaids().slice(0, -1);
            this.autoReserveForNewGroup(previousGroups, newRaid.groupId);
            console.log('Groupes après création :', JSON.stringify(this.getGroupedRaids(), null, 2));
        });
    }

    getGroupedRaids(): { groupId: number; raids: Raid[] }[] {
        const grouped: { [key: number]: Raid[] } = {};
        this.raids.forEach(raid => {
            const groupId = raid.groupId !== undefined && raid.groupId !== null ? raid.groupId : 0;
            if (!grouped[groupId]) {
                grouped[groupId] = [];
            }
            grouped[groupId].push(raid);
        });
        const result = Object.keys(grouped)
            .map(groupId => ({
                groupId: parseInt(groupId),
                raids: grouped[parseInt(groupId)].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }))
            .sort((a, b) => b.groupId - a.groupId);
        return result;
    }

    openModal(raid: Raid) {
        if (!raid?.bosses?.length) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun boss disponible pour ce raid', life: 5000 });
            return;
        }
        this.selectedRaid = raid;
        this.selectedBoss = raid.bosses[0];
        this.showModal = true;
        setTimeout(() => this.scrollToTop(), 0);
    }

    closeModal() {
        this.showModal = false;
        this.selectedRaid = null;
        this.selectedBoss = null;
    }

    selectBoss(boss: any) {
        this.selectedBoss = boss;
    }

    getGroupedLoots(): { slot: string; items: any[] }[] {
        if (!this.selectedBoss?.loots) return [];
        const grouped: { [key: string]: any[] } = {};
        this.selectedBoss.loots.forEach((loot: any) => {
            const slot = loot.slot || 'Unknown';
            if (!grouped[slot]) {
                grouped[slot] = [];
            }
            grouped[slot].push(loot);
        });
        return Object.keys(grouped).map(slot => ({
            slot,
            items: grouped[slot]
        }));
    }

    getLootDataWowhead(loot: any): string {
        return `item=${loot.itemId}`;
    }

    getBossIconUrl(boss: any): string {
        return boss.iconUrl || `https://wow.zamimg.com/images/wow/icons/large/achievement_boss_${boss.name.toLowerCase().replace(/ /g, '')}.jpg`;
    }

    getItemIconUrl(loot: any): string {
        return loot.iconUrl || 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg';
    }

    isReservedByCurrentUser(loot: any): boolean {
        const currentUser = this.authService.getCurrentUser();
        return loot.softReservedBy?.includes(currentUser) || false;
    }

    isLocked(): boolean {
        return false;
    }

    getCurrentUser(): string | null {
        return this.authService.getCurrentUser();
    }

    loadWowheadTooltips() {
        const script = document.createElement('script');
        script.src = 'https://wow.zamimg.com/js/tooltips.js';
        script.async = true;
        document.head.appendChild(script);
    }

    reserveLoot(bossName: string, lootId: string) {
        const currentUser = this.authService.getCurrentUser();
        console.log('reserveLoot appelé avec :', { bossName, lootId, currentUser });
        if (!currentUser) {
            console.log('Utilisateur non connecté');
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté', life: 5000 });
            return;
        }
        if (!this.selectedRaid || !this.selectedRaid.groupId) {
            console.log('Aucun raid ou groupe sélectionné', { selectedRaid: this.selectedRaid });
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun raid ou groupe sélectionné', life: 5000 });
            return;
        }
        console.log('Appel de reserveLootInGroup pour ajout', { groupId: this.selectedRaid.groupId, bossName, lootId, user: currentUser });
        this.raidService.reserveLootInGroup(this.selectedRaid.groupId, bossName, lootId, currentUser, true).subscribe({
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
        const currentUser = this.authService.getCurrentUser();
        console.log('removeReservation appelé avec :', { bossName, lootId, currentUser });
        if (!currentUser) {
            console.log('Utilisateur non connecté');
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté', life: 5000 });
            return;
        }
        if (!this.selectedRaid || !this.selectedRaid.groupId) {
            console.log('Aucun raid ou groupe sélectionné', { selectedRaid: this.selectedRaid });
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun raid ou groupe sélectionné', life: 5000 });
            return;
        }
        console.log('Appel de reserveLootInGroup pour suppression', { groupId: this.selectedRaid.groupId, bossName, lootId, user: currentUser });
        this.raidService.reserveLootInGroup(this.selectedRaid.groupId, bossName, lootId, currentUser, false).subscribe({
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
        if (!this.selectedRaid || !this.selectedRaid._id) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID du raid manquant ou raid non sélectionné', life: 5000 });
            return;
        }
        this.raidService.updateDrop(this.selectedRaid._id, bossName, lootId, selectedUser).subscribe({
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

    private scrollToTop() {
        this.lootList?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
}