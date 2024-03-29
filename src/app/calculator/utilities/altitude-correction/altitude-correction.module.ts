import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AltitudeCorrectionFormComponent } from './altitude-correction-form/altitude-correction-form.component';
import { AltitudeCorrectionComponent } from './altitude-correction.component';
import { AltitudeCorrectionService } from './altitude-correction.service';
import { AltitudeCorrectionHelpComponent } from './altitude-correction-help/altitude-correction-help.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [AltitudeCorrectionComponent, AltitudeCorrectionFormComponent, AltitudeCorrectionHelpComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [AltitudeCorrectionService],
  exports: [AltitudeCorrectionComponent]
})
export class AltitudeCorrectionModule { }
