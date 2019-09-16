import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeaeratorComponent } from './deaerator.component';
import { DeaeratorHelpComponent } from './deaerator-help/deaerator-help.component';
import { DeaeratorResultsComponent } from './deaerator-results/deaerator-results.component';
import { DeaeratorFormComponent } from './deaerator-form/deaerator-form.component';
import { DeaeratorService } from './deaerator.service';
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
  declarations: [DeaeratorComponent, DeaeratorHelpComponent, DeaeratorResultsComponent, DeaeratorFormComponent],
  exports: [DeaeratorComponent, DeaeratorResultsComponent],
  providers: [DeaeratorService]
})
export class DeaeratorModule { }
