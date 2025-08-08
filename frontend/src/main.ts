import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { routes } from './app/app-routing.module';
import { CalendarModule } from 'primeng/calendar';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideAnimations(),
        importProvidersFrom(
            CalendarModule,
            CommonModule,
            FormsModule,
            ToastModule,
            DialogModule,
            ButtonModule,
            InputTextModule,
            TooltipModule,
            TableModule,
            DropdownModule
        ),
        MessageService
    ]
}).catch(err => {
    console.error('Erreur lors du bootstrap de l\'application :', JSON.stringify(err, null, 2));
});