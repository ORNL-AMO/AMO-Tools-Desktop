import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { SlagCompareService } from './slag-compare.service';
import { SlagService } from './slag.service';
import { SlagComponent } from './slag.component';
import { SlagFormComponent } from './slag-form/slag-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    SlagComponent,
    SlagFormComponent
  ],
  providers: [
    SlagCompareService,
    SlagService
  ],
  exports: [
    SlagComponent
  ]
})
export class SlagModule { }
