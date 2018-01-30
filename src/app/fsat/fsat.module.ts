import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatComponent } from './fsat.component';
import { FsatService } from './fsat.service';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../settings/settings.module';
import { FsatBannerComponent } from './fsat-banner/fsat-banner.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule
  ],
  declarations: [FsatComponent, FsatBannerComponent],
  providers: [FsatService],
  exports: [FsatComponent]
})
export class FsatModule { }
