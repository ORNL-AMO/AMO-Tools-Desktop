import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoilerComponent } from './boiler.component';
import { BoilerFormComponent } from './boiler-form/boiler-form.component';
import { BoilerHelpComponent } from './boiler-help/boiler-help.component';
import { BoilerResultsComponent } from './boiler-results/boiler-results.component';
import { BoilerService } from './boiler.service';
import { ReactiveFormsModule } from '../../../../../node_modules/@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SharedPipesModule
  ],
  declarations: [BoilerComponent, BoilerFormComponent, BoilerHelpComponent, BoilerResultsComponent],
  exports: [BoilerComponent, BoilerResultsComponent],
  providers: [BoilerService]
})
export class BoilerModule { }
