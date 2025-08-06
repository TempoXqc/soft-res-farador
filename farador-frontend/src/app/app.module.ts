import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { LoginModalComponent } from './auth/login-modal.component';
import {RaidReservationComponent} from "./raids/raid-reservation/raid-reservation.component";
import {RaidListComponent} from "./raids/raid-list/raid-list.component";

@NgModule({
    declarations: [
        AppComponent,
        LoginModalComponent,
        RaidReservationComponent,
        RaidListComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        DialogModule,
        TableModule,
        ButtonModule,
        InputTextModule
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}