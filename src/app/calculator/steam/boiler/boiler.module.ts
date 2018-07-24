import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoilerComponent } from './boiler.component';
import { BoilerFormComponent } from './boiler-form/boiler-form.component';
import { BoilerHelpComponent } from './boiler-help/boiler-help.component';
import { BoilerResultsComponent } from './boiler-results/boiler-results.component';
import { BoilerService } from './boiler.service';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '../../../../../node_modules/@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [BoilerComponent, BoilerFormComponent, BoilerHelpComponent, BoilerResultsComponent],
  exports: [BoilerComponent],
  providers: [BoilerService]
})
export class BoilerModule { }
