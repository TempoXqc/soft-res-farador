import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RaidListComponent } from './raids/raid-list.component';

export const routes: Routes = [
    { path: 'raids', component: RaidListComponent },
    { path: '', redirectTo: '/raids', pathMatch: 'full' },
    { path: '**', redirectTo: '/raids' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}