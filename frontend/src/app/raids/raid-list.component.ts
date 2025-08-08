import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RaidService } from '../services/raid.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { io, Socket } from 'socket.io-client';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { UserService } from '../services/user.service';
import { Raid } from '../models/raid';
import { User } from '../models/user';
import { ToastModule } from 'primeng/toast';
import {LoginModalComponent} from "../auth/login-modal.component";
import {Router} from "@angular/router";
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {CalendarModule} from "primeng/calendar";
import {MultiSelectModule} from "primeng/multiselect";
import {environment} from "../../environments/environment";
import {jwtDecode} from "jwt-decode";

const MANAFORGE_OMEGA_BOSSES = [
    {
        name: "Plexus Sentinel",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-arcanomatrixwarden.png",
        loots: [
            { id: "plexus_001", itemId: "237547", itemName: "Mounted Manacannons", slot: "Shoulder", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_shoulder_cloth_raidpriestethereal_d_01.jpg" },
            { id: "plexus_002", itemId: "237534", itemName: "Singed Sievecuffs", slot: "Wrist", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_cloth_raidmageethereal_d_01.jpg" },
            { id: "plexus_003", itemId: "237525", itemName: "Irradiated Impurity Filter", slot: "Head", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_helm_leather_raidmonkethereal_d_01.jpg" },
            { id: "plexus_004", itemId: "237533", itemName: "Atomic Phasebelt", slot: "Waist", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_leather_raidmonkethereal_d_01.jpg" },
            { id: "plexus_005", itemId: "237523", itemName: "Arcanotech Wrist-Matrix", slot: "Wrist", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_mail_raidevokerethereal_d_01.jpg" },
            { id: "plexus_006", itemId: "237543", itemName: "Chambersieve Waistcoat", slot: "Legs", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_pant_mail_raidhunterethereal_d_01.jpg" },
            { id: "plexus_007", itemId: "237528", itemName: "Manaforged Displacement Chassis", slot: "Chest", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_chest_plate_raidwarriorethereal_d_01.jpg" },
            { id: "plexus_008", itemId: "237551", itemName: "Sterilized Expulsion Boots", slot: "Feet", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_plate_raiddeathknightethereal_d_01.jpg" },
            { id: "plexus_009", itemId: "242394", itemName: "Eradicating Arcanocore", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_obliterationcannon.jpg" },
            { id: "plexus_010", itemId: "237567", itemName: "Logic Gate: Alpha", slot: "Ring", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_ring03_etherealtechnomancerstyle_gold.jpg" },
            { id: "plexus_011", itemId: "237739", itemName: "Obliteration Beamglaive", slot: "Polearm", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_polearm_2h_etherealraid_d_01.jpg" },
            { id: "plexus_012", itemId: "237736", itemName: "Overclocked Plexhammer", slot: "One-Hand Mace", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_mace_1h_etherealraid_d_01.jpg" },
            { id: "plexus_013", itemId: "237813", itemName: "Factory-Issue Plexhammer", slot: "One-Hand Mace", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_mace_1h_etherealraid_d_02.jpg" }
        ]
    },
    {
        name: "Loom’ithar",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-loombeast.png",
        loots: [
            { id: "loomithar_001", itemId: "237524", itemName: "Laced Lair-Steppers", slot: "Feet", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_cloth_raidmageethereal_d_01.jpg" },
            { id: "loomithar_002", itemId: "237552", itemName: "Deathbound Shoulderpads", slot: "Shoulder", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_shoulder_leather_raidrogueethereal_d_01.jpg" },
            { id: "loomithar_003", itemId: "237522", itemName: "Colossal Lifetether", slot: "Waist", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_mail_raidhunterethereal_d_01.jpg" },
            { id: "loomithar_004", itemId: "237545", itemName: "Discarded Nutrient Shackles", slot: "Wrist", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_plate_raidwarriorethereal_d_01.jpg" },
            { id: "loomithar_005", itemId: "237732", itemName: "Piercing Strandbow", slot: "Bow", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bow_1h_etherealraid_d_01.jpg" },
            { id: "loomithar_006", itemId: "237729", itemName: "Prodigious Gene Splicer", slot: "Dagger", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_knife_1h_etherealraid_d_01.jpg" },
            { id: "loomithar_011", itemId: "237723", itemName: "Ward of the Weaving-Beast", slot: "Shield", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_shield_1h_etherealraid_d_01.jpg" },
            { id: "loomithar_013", itemId: "242393", itemName: "Loom'ithar's Living Silk", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_astralspinneret.jpg" },
            { id: "loomithar_014", itemId: "242395", itemName: "Astral Antenna", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_silkwormsantenna.jpg" },
            { id: "loomithar_015", itemId: "245510", itemName: "Loombeast Silk", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_arcane_beam.jpg" }
        ]
    },
    {
        name: "Soulbinder Naazindhri",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-soulbindernaazindhri.png",
        loots: [
            { id: "naazindhri_001", itemId: "237527", itemName: "Frock of Spirit's Reunion", slot: "Chest", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_robe_cloth_raidwarlockethereal_d_01.jpg" },
            { id: "naazindhri_002", itemId: "237546", itemName: "Bindings of Lost Essence", slot: "Wrist", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_leather_raiddruidethereal_d_01.jpg" },
            { id: "naazindhri_003", itemId: "237539", itemName: "Deathspindle Talons", slot: "Feet", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_mail_raidevokerethereal_d_01.jpg" },
            { id: "naazindhri_004", itemId: "237550", itemName: "Fresh Ethereal Fetters", slot: "Waist", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_plate_raidwarriorethereal_d_01.jpg" },
            { id: "naazindhri_005", itemId: "237568", itemName: "Chrysalis of Sundered Souls", slot: "Neck", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_necklace01_etherealnontechnologicalstyle_gold.jpg" },
            { id: "naazindhri_006", itemId: "237738", itemName: "Unbound Training Claws", slot: "Fist Weapon", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_hand_1h_etherealraid_d_01.jpg" },
            { id: "naazindhri_011", itemId: "237730", itemName: "Voidglass Spire", slot: "Staff", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_staff_2h_etherealraid_d_02.jpg" },
            { id: "naazindhri_013", itemId: "242391", itemName: "Soulbinder's Embrace", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_manaforge_tanktrinket1.jpg" },
            { id: "naazindhri_014", itemId: "238033", itemName: "Zadus's Liturgical Hat", slot: "Head", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_helm_cloth_raidmageethereal_d_01.jpg" },
            { id: "naazindhri_015", itemId: "243048", itemName: "Technomancer's Service Sandals", slot: "Feet", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_cloth_raidpriestethereal_d_01.jpg" }
        ]
    },
    {
        name: "Forgeweaver Araz",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-highmanaforgeraraz.png",
        loots: [
            { id: "araz_001", itemId: "237538", itemName: "Forgeweaver's Journal Holster", slot: "Waist", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_cloth_raidwarlockethereal_d_01.jpg" },
            { id: "araz_002", itemId: "237553", itemName: "Laboratory Test Slippers", slot: "Feet", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_leather_raiddruidethereal_d_01.jpg" },
            { id: "araz_003", itemId: "237529", itemName: "Harvested Attendant's Uniform", slot: "Chest", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_chest_mail_raidhunterethereal_d_01.jpg" },
            { id: "araz_004", itemId: "237526", itemName: "Breached Containment Guards", slot: "Hands", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_glove_plate_raiddeathknightethereal_d_01.jpg" },
            { id: "araz_005", itemId: "237737", itemName: "Photon Sabre Prime", slot: "Two-Hand Sword", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_sword_2h_etherealraid_d_01.jpg" },
            { id: "araz_011", itemId: "237724", itemName: "Iris of the Dark Beyond", slot: "Off-Hand", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_offhand_1h_etherealraid_d_01.jpg" },
            { id: "araz_012", itemId: "237570", itemName: "Logic Gate: Omega", slot: "Ring", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_ring03_etherealtechnomancerstyle_terra.jpg" },
            { id: "araz_013", itemId: "237726", itemName: "Marvel of Technomancy", slot: "Staff", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_staff_2h_etherealraid_d_01.jpg" },
            { id: "araz_014", itemId: "242402", itemName: "Araz's Ritual Forge", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_trinkettechnomancer_ritualengine.jpg" },
        ]
    },
    {
        name: "The Soul Hunters",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-thesoulhunters.png",
        loots: [
            { id: "soulhunters_001", itemId: "237549", itemName: "Bloodwrath's Gnarled Claws", slot: "Hands", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_glove_cloth_raidwarlockethereal_d_01.jpg" },
            { id: "soulhunters_002", itemId: "243305", itemName: "Interloper's Silken Striders", slot: "Feet", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_cloth_raidpriestethereal_d_01.jpg" },
            { id: "soulhunters_003", itemId: "237541", itemName: "Darksorrow's Corrupted Carapace", slot: "Chest", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_chest_leather_raiddemonhunterethereal_d_01.jpg" },
            { id: "soulhunters_004", itemId: "243306", itemName: "Interloper's Reinforced Sandals", slot: "Feet", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_leather_raidmonkethereal_d_01.jpg" },
            { id: "soulhunters_005", itemId: "237554", itemName: "Clasp of Furious Freedom", slot: "Waist", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_mail_raidshamanethereal_d_01.jpg" },
            { id: "soulhunters_006", itemId: "243308", itemName: "Interloper's Chain Boots", slot: "Feet", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_mail_raidshamanethereal_d_01.jpg" },
            { id: "soulhunters_007", itemId: "237561", itemName: "Yoke of Enveloping Hatred", slot: "Wrist", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_plate_raidpaladinethereal_d_01_bracer.jpg" },
            { id: "soulhunters_008", itemId: "243307", itemName: "Interloper's Plated Sabatons", slot: "Feet", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_plate_raidpaladinethereal_d_01_boot.jpg" },
            { id: "soulhunters_009", itemId: "237727", itemName: "Collapsing Phaseblades", slot: "Warglaives", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_glaive_1h_etherealraid_d_01.jpg" },
            { id: "soulhunters_010", itemId: "237741", itemName: "Event Horizon", slot: "Shield", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_shield_1h_etherealraid_d_01.jpg" },
            { id: "soulhunters_011", itemId: "242397", itemName: "Sigil of the Cosmic Hunt", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_agidpsancientkareshirelic.jpg" },
            { id: "soulhunters_012", itemId: "242401", itemName: "Brand of Ceaseless Ire", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_manaforgetanktrinket3.jpg" },
            { id: "soulhunters_017", itemId: "238031", itemName: "Veiled Manta Vest", slot: "Chest", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_chest_leather_raidrogueethereal_d_01.jpg" },
            { id: "soulhunters_018", itemId: "238027", itemName: "Harvested Creephide Cord", slot: "Waist", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_leather_raiddemonhunterethereal_d_01.jpg" }
        ]
    },
    {
        name: "Fractillus",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-fractillus.png",
        loots: [
            { id: "fractillus_001", itemId: "237558", itemName: "Conjoined Glass Bracers", slot: "Wrist", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_cloth_raidpriestethereal_d_01.jpg" },
            { id: "fractillus_002", itemId: "237565", itemName: "Kinetic Dunerunners", slot: "Feet", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_leather_raiddemonhunterethereal_d_01.jpg" },
            { id: "fractillus_003", itemId: "237536", itemName: "Bite of the Astral Wastes", slot: "Head", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_helm_mail_raidshamanethereal_d_01.jpg" },
            { id: "fractillus_004", itemId: "237530", itemName: "Shrapnel-Fused Legguards", slot: "Legs", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_pant_plate_raiddeathknightethereal_d_01.jpg" },
            { id: "fractillus_005", itemId: "237728", itemName: "Voidglass Kris", slot: "Dagger", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_knife_1h_etherealraid_d_02.jpg" },
            { id: "fractillus_006", itemId: "237733", itemName: "Lacerated Current Caster", slot: "Crossbow", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_crossbow_2h_etherealraid_d_01.jpg" },
            { id: "fractillus_007", itemId: "237742", itemName: "Fractillus' Last Breath", slot: "Off-Hand", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_offhand_1h_etherealraid_d_02.jpg" },
            { id: "fractillus_008", itemId: "242392", itemName: "Diamantine Voidcore", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_intdps_ancientkareshirelic.jpg" },
            { id: "fractillus_009", itemId: "242396", itemName: "Unyielding Netherprism", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_voidprism.jpg" },
            { id: "fractillus_014", itemId: "238032", itemName: "Acolyte's Infused Leggings", slot: "Legs", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_pant_mail_raidevokerethereal_d_01.jpg" },
            { id: "fractillus_015", itemId: "238030", itemName: "Voidhound Trainer's Boots", slot: "Feet", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_mail_raidshamanethereal_d_01.jpg" }
        ]
    },
    {
        name: "Nexus-King Salhadaar",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-nexuskingsalhadaar.png",
        loots: [
            { id: "salhadaar_001", itemId: "237556", itemName: "Sandals of Scarred Servitude", slot: "Feet", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_cloth_raidwarlockethereal_d_01.jpg" },
            { id: "salhadaar_002", itemId: "237548", itemName: "Twilight Tyrant's Veil", slot: "Head", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_helm_cloth_raidpriestethereal_d_01.jpg" },
            { id: "salhadaar_003", itemId: "237557", itemName: "Reaper's Dreadbelt", slot: "Waist", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_leather_raidrogueethereal_d_01.jpg" },
            { id: "salhadaar_004", itemId: "237531", itemName: "Elite Shadowguard Legwraps", slot: "Legs", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_pant_leather_raidmonkethereal_d_01.jpg" },
            { id: "salhadaar_005", itemId: "237555", itemName: "Pactbound Vambraces", slot: "Wrist", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_mail_raidshamanethereal_d_01.jpg" },
            { id: "salhadaar_006", itemId: "237544", itemName: "Royal Voidscale Gauntlets", slot: "Hands", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_glove_mail_raidevokerethereal_d_01.jpg" },
            { id: "salhadaar_007", itemId: "237564", itemName: "Darkrider Sabatons", slot: "Feet", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_plate_raidwarriorethereal_d_01.jpg" },
            { id: "salhadaar_008", itemId: "237532", itemName: "Beacons of False Righteousness", slot: "Shoulder", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_plate_raidpaladinethereal_d_01_shoulder.jpg" },
            { id: "salhadaar_009", itemId: "242406", itemName: "Salhadaar's Folly", slot: "Neck", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_necklace02_etherealribbonorrunestyle_gold.jpg" },
            { id: "salhadaar_010", itemId: "237740", itemName: "Vengeful Netherspike", slot: "Dagger", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_knife_1h_etherealraid_d_02.jpg" },
            { id: "salhadaar_011", itemId: "237735", itemName: "Voidglass Sovereign's Blade", slot: "One-Hand Sword", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_sword_1h_etherealraid_d_01.jpg" },
            { id: "salhadaar_012", itemId: "237734", itemName: "Oath-Breaker's Recompense", slot: "One-Hand Axe", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_axe_1h_etherealraid_d_01.jpg" },
            { id: "salhadaar_013", itemId: "243365", itemName: "Maw of the Void", slot: "Two-Hand Mace", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_mace_2h_etherealking_d_01.jpg" },
            { id: "salhadaar_014", itemId: "242403", itemName: "Perfidious Projector", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_11_0_etherealraid_communicator_color4.jpg" },
            { id: "salhadaar_015", itemId: "242400", itemName: "Nexus-King's Command", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_oathbindersauthority.jpg" },
            { id: "salhadaar_016", itemId: "238036", itemName: "Entropy", slot: "Ring", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_ring03_etherealtechnomancerstyle_dark.jpg" }
        ]
    },
    {
        name: "Dimensius, the All-Devouring",
        iconUrl: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-dimensius.png",
        loots: [
            { id: "dimensius_001", itemId: "237559", itemName: "Singularity Cincture", slot: "Waist", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_cloth_raidpriestethereal_d_01.jpg" },
            { id: "dimensius_002", itemId: "237542", itemName: "Stellar Navigation Slacks", slot: "Legs", softReservedBy: [], classAllowed: ["Mage", "Priest", "Warlock"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_pant_cloth_raidmageethereal_d_01.jpg" },
            { id: "dimensius_003", itemId: "237562", itemName: "Time-Compressed Wristguards", slot: "Wrist", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_bracer_leather_raiddemonhunterethereal_d_01.jpg" },
            { id: "dimensius_004", itemId: "237540", itemName: "Winged Gamma Handlers", slot: "Hands", softReservedBy: [], classAllowed: ["Druid", "Monk", "Rogue", "Demon Hunter"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_glove_leather_raiddruidethereal_d_01.jpg" },
            { id: "dimensius_005", itemId: "237537", itemName: "Claws of Failed Resistance", slot: "Shoulder", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_shoulder_mail_raidshamanethereal_d_01.jpg" },
            { id: "dimensius_006", itemId: "237560", itemName: "Greaves of Shattered Space", slot: "Feet", softReservedBy: [], classAllowed: ["Hunter", "Shaman", "Evoker"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_boot_mail_raidhunterethereal_d_01.jpg" },
            { id: "dimensius_007", itemId: "237535", itemName: "Artoshion's Abyssal Stare", slot: "Head", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_plate_raidpaladinethereal_d_01_helm.jpg" },
            { id: "dimensius_008", itemId: "237563", itemName: "Ultradense Fission Girdle", slot: "Waist", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_belt_plate_raiddeathknightethereal_d_01.jpg" },
            { id: "dimensius_009", itemId: "242405", itemName: "Band of the Shattered Soul", slot: "Ring", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_ring02_etherealribbonorrunestyle_gold.jpg" },
            { id: "dimensius_010", itemId: "237731", itemName: "Ergospheric Cudgel", slot: "One-Hand Mace", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_mace_1h_etherealraid_d_02.jpg" },
            { id: "dimensius_011", itemId: "237725", itemName: "Supermassive Starcrusher", slot: "Two-Hand Mace", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_mace_2h_etherealraid_d_01.jpg" },
            { id: "dimensius_012", itemId: "242404", itemName: "All-Devouring Nucleus", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_omnidpstrinket.jpg" },
            { id: "dimensius_013", itemId: "242399", itemName: "Screams of a Forgotten Sky", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_raidtrinkets_blobofswirlingvoid_terra.jpg" },
            { id: "dimensius_015", itemId: "246565", itemName: "Cosmic Hearthstone", slot: "Toy", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_circleofrenewal_shadow.jpg" },
            { id: "dimensius_019", itemId: "249699", itemName: "Shadowguard Translocator", slot: "Trinket", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_engineering_failure-detection-pylon.jpg" },
            { id: "dimensius_020", itemId: "246492", itemName: "Soulgorged Augment Rune", slot: "Consumable", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/ability_demonhunter_sigilpurple.jpg" },
            { id: "dimensius_021", itemId: "246727", itemName: "Ethereal Essence Sliver", slot: "Reagent", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_112_arcane_missile.jpg" },
            { id: "dimensius_022", itemId: "238866", itemName: "K'aresh Dust", slot: "Reagent", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_enchanting_dust_color2.jpg" },
            { id: "dimensius_023", itemId: "240175", itemName: "Crystallized Ethereal Voidsplinter", slot: "Reagent", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/trade_enchanting_smalletherealshard.jpg" },
            { id: "dimensius_024", itemId: "246737", itemName: "K'areshi Voidstone", slot: "Reagent", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/trade_enchanting_largeetherealshard.jpg" },
            { id: "dimensius_025", itemId: "60854", itemName: "Loot-A-Rang", slot: "Toy", softReservedBy: [], classAllowed: [], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_eng_mechanicalboomerang2.jpg" },
            { id: "dimensius_026", itemId: "238028", itemName: "Bone-Melted Faceplate", slot: "Head", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_helm_plate_raidwarriorethereal_d_01.jpg" },
            { id: "dimensius_027", itemId: "238034", itemName: "Jak'tull's Intruder Stompers", slot: "Feet", softReservedBy: [], classAllowed: ["Death Knight", "Paladin", "Warrior"], iconUrl: "https://wow.zamimg.com/images/wow/icons/large/inv_plate_raidpaladinethereal_d_01_boot.jpg" }
        ]
    }
];

@Component({
    selector: 'app-raid-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TooltipModule, TableModule, DropdownModule, ToastModule, LoginModalComponent, Button, DialogModule, CalendarModule, ReactiveFormsModule, MultiSelectModule],
    templateUrl: './raid-list.component.html',
    styleUrls: ['./raid-list.component.scss']
})
export class RaidListComponent implements OnInit, OnDestroy {
    raids: Raid[] = [];
    users: User[] = [];
    userOptions: any[] = [];
    isLoggedIn: boolean = false;
    username: string | null = null;
    selectedBoss: any = null;
    showLoginModal: boolean = true;
    showCreateRaidModal: boolean = false;
    raidGroups: { groupId: number; raids: Raid[]; bosses: any[] }[] = [];
    selectedGroup: { groupId: number; raids: Raid[]; bosses: any[] } | null = null;
    @ViewChild('lootList') lootList!: ElementRef;
    @Output() raidCreated = new EventEmitter<void>();
    private socket: Socket;
    newRaid: any = {
        name: 'Manaforge Omega',
        difficulty: 'Normal',
        date: null,
        groupId: 1,
        bosses: MANAFORGE_OMEGA_BOSSES
    };
    difficulties: any[] = [
        { label: 'Normal', value: 'Normal' },
        { label: 'Heroic', value: 'Heroic' },
        { label: 'Mythic', value: 'Mythic' }
    ];
    disabledDays: number[] = [0, 1, 3, 4, 5, 6];

    constructor(
        private raidService: RaidService,
        private authService: AuthService,
        private messageService: MessageService,
        private userService: UserService,
        private cdr: ChangeDetectorRef,
        private router: Router,
    ) {
        this.socket = io(environment.socketUrl, { reconnection: true, reconnectionAttempts: 5 });
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
        this.authService.loginModalState$.subscribe(state => {
            this.showLoginModal = state;
        });
        this.setupSocketListeners();
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }

    loadRaids() {
        if (!this.getCurrentUser()) {
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
            error: (err) => {
                console.error('Erreur lors du chargement des raids :', JSON.stringify(err, null, 2));
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les raids' });
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
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.userOptions = users.map(user => ({
                    label: user.username,
                    value: user.username
                }));
            },
            error: (err) => {
                console.error('Erreur lors du chargement des utilisateurs :', err);
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('connect_error', (err) => {
            console.error('Erreur de connexion WebSocket :', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur WebSocket', detail: 'Impossible de se connecter au serveur', life: 5000 });
        });

        this.socket.on('raidUpdated', (updatedRaid: Raid) => {
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

    addReservation(bossName: string, lootId: string) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté', life: 5000 });
            return;
        }
        if (!this.selectedGroup) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun groupe sélectionné', life: 5000 });
            return;
        }
        this.raidService.reserveLootInGroup(this.selectedGroup.groupId, bossName, lootId, currentUser, true).subscribe({
            next: () => {
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
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun groupe sélectionné', life: 5000 });
            return;
        }
        this.raidService.reserveLootInGroup(this.selectedGroup.groupId, bossName, lootId, currentUser, false).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Réservation supprimée', life: 5000 });
            },
            error: (err: any) => {
                console.error('Erreur lors de l’annulation de la réservation :', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Échec de la suppression de la réservation', life: 5000 });
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

    selectBoss(boss: any) {
        this.selectedBoss = boss;
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToTop(), 0);
    }

    updateDrop(groupId: number, bossName: string, itemId: string, droppedTo: string[]) {
        this.raidService.updateDrop(groupId, bossName, itemId, droppedTo).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Drop mis à jour avec succès' });
                this.loadRaids();
            },
            error: (err) => {
                console.error('Erreur lors de la mise à jour du drop :', JSON.stringify(err, null, 2));
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour le drop : ' + (err.statusText || err.message) });
            }
        });
    }

    updateReservedBy(groupId: number, bossName: string, itemId: string, softReservedBy: string[]) {
        const uniqueReservedBy = [...new Set(softReservedBy)];
        this.raidService.updateReserved(groupId, bossName, itemId, uniqueReservedBy).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Réservations mises à jour avec succès' });
                const raid = this.raids.find(r => r.groupId === groupId);
                if (raid) {
                    const boss = raid.bosses?.find(b => b.name === bossName);
                    if (boss) {
                        const loot = boss.loots?.find(l => l.id === itemId);
                        if (loot) {
                            loot.softReservedBy = softReservedBy;
                        }
                    }
                }
                this.groupRaidsByGroupId();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Erreur lors de la mise à jour des réservations :', JSON.stringify(err, null, 2));
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour les réservations : ' + (err.statusText || err.message) });
            }
        });
    }

    openLoginModal() {
        this.authService.showLoginModal();
    }

    getCurrentUser(): string | null {
        return this.authService.getCurrentUser();
    }

    openCreateRaidModal() {
        this.newRaid = {
            name: 'Manaforge Omega',
            difficulty: 'Normal',
            date: null,
            groupId: this.raidGroups.length ? Math.max(...this.raidGroups.map(g => g.groupId)) + 1 : 1,
            bosses: MANAFORGE_OMEGA_BOSSES
        };
        this.showCreateRaidModal = true;
        this.cdr.detectChanges();
    }

    closeCreateRaidModal() {
        this.showCreateRaidModal = false;
        this.newRaid = { name: 'Manaforge Omega', difficulty: 'Normal', date: null, groupId: 1, bosses: MANAFORGE_OMEGA_BOSSES };
        this.cdr.detectChanges();
    }

    createRaid() {
        if (!this.newRaid.difficulty || !this.newRaid.date) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La difficulté et la date sont requises' });
            return;
        }

        const raidDate = new Date(this.newRaid.date);
        if (raidDate.getDay() !== 2) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La date doit être un mardi' });
            return;
        }

        raidDate.setHours(20, 0, 0, 0);
        this.newRaid.date = raidDate;

        this.raidService.createRaid(this.newRaid).subscribe({
            next: (raid) => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Premier raid créé avec succès' });

                const nextTuesday = new Date(raidDate);
                nextTuesday.setDate(raidDate.getDate() + 7);
                nextTuesday.setHours(20, 0, 0, 0);

                const secondRaid = {
                    name: 'Manaforge Omega',
                    difficulty: this.newRaid.difficulty,
                    date: nextTuesday,
                    groupId: this.newRaid.groupId,
                    bosses: MANAFORGE_OMEGA_BOSSES
                };

                this.raidService.createRaid(secondRaid).subscribe({
                    next: (secondRaid) => {
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Second raid créé avec succès' });
                        this.loadRaids();
                        this.raidCreated.emit();
                        this.closeCreateRaidModal();
                    },
                    error: (err) => {
                        console.error('Erreur lors de la création du second raid :', err);
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de créer le second raid' });
                    }
                });
            },
            error: (err) => {
                console.error('Erreur lors de la création du premier raid :', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de créer le premier raid' });
            }
        });
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

    public isLocked(groupId: number): boolean {
        const group = this.raidGroups.find(g => g.groupId === groupId);
        if (!group || !group.raids || group.raids.length === 0) {
            return false;
        }
        const earliestRaid = group.raids.reduce((min, raid) =>
            new Date(raid.date) < new Date(min.date) ? raid : min, group.raids[0]);
        const earliestRaidDate = new Date(earliestRaid.date);
        const lockTime = new Date(earliestRaidDate);
        lockTime.setHours(18, 0, 0, 0);
        return new Date() > lockTime;
    }

    public getLockDate(groupId: number): string | null {
        const group = this.raidGroups.find(g => g.groupId === groupId);
        if (!group || !group.raids || group.raids.length === 0) {
            return null;
        }
        const earliestRaid = group.raids.reduce((min, raid) =>
            new Date(raid.date) < new Date(min.date) ? raid : min, group.raids[0]);
        const earliestRaidDate = new Date(earliestRaid.date);
        const lockTime = new Date(earliestRaidDate);
        lockTime.setHours(18, 0, 0, 0);
        return `${lockTime.getDate().toString().padStart(2, '0')}/${(lockTime.getMonth() + 1).toString().padStart(2, '0')}/${lockTime.getFullYear()}`;
    }

    public reserveLoot(groupId: number, bossName: string, itemId: string) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Vous devez être connecté pour réserver', life: 5000 });
            return;
        }
        if (!this.selectedGroup) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun groupe sélectionné', life: 5000 });
            return;
        }
        if (this.isLocked(groupId)) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les réservations sont verrouillées après 18h le jour du raid', life: 5000 });
            return;
        }

        const raid = this.raids.find(r => r.groupId === groupId);
        const boss = raid?.bosses?.find(b => b.name === bossName);
        const loot = boss?.loots?.find(l => l.itemId === itemId);  // Changed to l.itemId

        if (!loot) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Item non trouvé', life: 5000 });
            return;
        }

        this.raidService.reserveLootInGroup(groupId, bossName, itemId, currentUser, true).subscribe({  // Pass itemId
            next: () => {
                loot.softReservedBy.push(currentUser);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Item réservé', life: 5000 });
                this.groupRaidsByGroupId();
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Erreur lors de la réservation :', JSON.stringify(err, null, 2));
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Impossible de réserver l\'item', life: 5000 });
            }
        });
    }

    public cancelReservation(groupId: number, bossName: string, itemId: string) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté', life: 5000 });
            return;
        }
        if (!this.selectedGroup) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun groupe sélectionné', life: 5000 });
            return;
        }
        if (this.isLocked(groupId)) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les réservations sont verrouillées après 18h le jour du raid', life: 5000 });
            return;
        }

        const raid = this.raids.find(r => r.groupId === groupId);
        const boss = raid?.bosses?.find(b => b.name === bossName);
        const loot = boss?.loots?.find(l => l.itemId === itemId);  // Changed to l.itemId

        if (!loot) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Item non trouvé', life: 5000 });
            return;
        }

        this.raidService.reserveLootInGroup(groupId, bossName, itemId, currentUser, false).subscribe({  // Pass itemId
            next: () => {
                loot.softReservedBy = loot.softReservedBy.filter(u => u !== currentUser);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Réservation annulée', life: 5000 });
                this.groupRaidsByGroupId();
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Erreur lors de l’annulation de la réservation :', JSON.stringify(err, null, 2));
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Échec de la suppression de la réservation', life: 5000 });
            }
        });
    }

    protected readonly Array = Array;
}