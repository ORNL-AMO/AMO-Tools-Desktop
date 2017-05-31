import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonToCsvService } from './json-to-csv.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    JsonToCsvService
  ],
  declarations: []
})
export class JsonToCsvModule { }
