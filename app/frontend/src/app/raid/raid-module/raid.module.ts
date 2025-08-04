import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaidListComponent } from '../raid-list/raid-list.component';
import {RaidDetailComponent} from "../raid-detail/raid-detail.component";
import {LootTableComponent} from "../loot-table/loot-table.component";

@NgModule({
    declarations: [RaidListComponent, RaidDetailComponent, LootTableComponent],
    imports: [CommonModule, FormsModule],
    exports: [RaidListComponent, RaidDetailComponent]
})
export class RaidModule {}