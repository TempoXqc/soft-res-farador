import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { RaidModule } from './raid/raid-module/raid.module';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, HttpClientModule, FormsModule, AppRoutingModule, AuthModule, RaidModule],
    bootstrap: [AppComponent]
})
export class AppModule {}