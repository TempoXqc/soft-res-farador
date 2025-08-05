
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModalComponent } from './auth/login-modal.component';
import { RaidListComponent } from './raids/raid-list.component';
import { RaidReservationComponent } from './raids/raid-reservation.component';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        AppRoutingModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        TableModule,
        AccordionModule,
        DropdownModule,
        RaidReservationComponent,
        LoginModalComponent,
        RaidListComponent
    ],
    providers: [MessageService],
    bootstrap: [AppComponent]
})
export class AppModule {}
