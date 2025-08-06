import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RaidListComponent } from './raids/raid-list/raid-list.component';
import { RaidReservationComponent } from './raids/raid-reservation/raid-reservation.component';

const routes: Routes = [
    { path: '', component: RaidListComponent },
    { path: 'raid/:id', component: RaidReservationComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

