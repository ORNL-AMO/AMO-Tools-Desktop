import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonToCsvService } from './json-to-csv.service';
import { ProjElectronModule } from '../proj-electron/proj-electron.module';

@NgModule({
  imports: [
    CommonModule,
    ProjElectronModule
  ],
  providers: [
    JsonToCsvService
  ],
  declarations: []
})
export class JsonToCsvModule { }
