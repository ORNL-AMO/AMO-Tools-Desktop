import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FanAffinityLawComponent } from './fan-affinity-law.component';
import { FanAffinityLawFormComponent } from './fan-affinity-law-form/fan-affinity-law-form.component';

@NgModule({
  declarations: [
    FanAffinityLawComponent,
    FanAffinityLawFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [FanAffinityLawComponent],
  providers: []
})
export class FanAffinityLawModule { }