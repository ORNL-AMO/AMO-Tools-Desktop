import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeaeratorComponent } from './deaerator.component';
import { DeaeratorHelpComponent } from './deaerator-help/deaerator-help.component';
import { DeaeratorResultsComponent } from './deaerator-results/deaerator-results.component';
import { DeaeratorFormComponent } from './deaerator-form/deaerator-form.component';
import { DeaeratorService } from './deaerator.service';
import { ReactiveFormsModule, FormsModule } from '../../../../../node_modules/@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [DeaeratorComponent, DeaeratorHelpComponent, DeaeratorResultsComponent, DeaeratorFormComponent],
  exports: [DeaeratorComponent],
  providers: [DeaeratorService]
})
export class DeaeratorModule { }
