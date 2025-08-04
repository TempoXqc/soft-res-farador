import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RaidListComponent } from './raid/raid-list/raid-list.component';
import { RaidDetailComponent } from './raid/raid-detail/raid-detail.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'raids', component: RaidListComponent, canActivate: [AuthGuard] },
    { path: 'raids/:id', component: RaidDetailComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}