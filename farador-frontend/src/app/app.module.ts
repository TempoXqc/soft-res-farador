import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { RaidService } from './services/raid.service';
import {RaidListComponent} from "./raids/raid-list/raid-list.component";
import {LoginModalComponent} from "./auth/login-modal.component"; // Adjust path if necessary

@NgModule({
    declarations: [
        AppComponent,
        RaidListComponent,
        LoginModalComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        ToastModule
    ],
    providers: [
        MessageService,
        AuthService,
        RaidService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }