import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventoryComponent } from './compressed-air-inventory.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { ImportExportModule } from '../shared/import-export/import-export.module';



@NgModule({
  declarations: [
    CompressedAirInventoryComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,   
    ImportExportModule
  ],
  providers: [
    CompressedAirInventoryService
  ]
})
export class CompressedAirInventoryModule { }
