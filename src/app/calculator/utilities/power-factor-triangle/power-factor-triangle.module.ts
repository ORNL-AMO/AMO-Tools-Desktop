import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { PowerFactorTriangleComponent } from './power-factor-triangle.component';
import { PowerFactorTriangleFormComponent } from './power-factor-triangle-form/power-factor-triangle-form.component';
import { PowerFactorTriangleHelpComponent } from './power-factor-triangle-help/power-factor-triangle-help.component';
import { PowerFactorTriangleResultsComponent } from './power-factor-triangle-results/power-factor-triangle-results.component';
import { PowerFactorTriangleService } from './power-factor-triangle.service';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ExportableResultsTableModule
  ],
  declarations: [
    PowerFactorTriangleComponent, 
    PowerFactorTriangleFormComponent, 
    PowerFactorTriangleHelpComponent,
    PowerFactorTriangleResultsComponent
  ],
  providers: [
    PowerFactorTriangleService
  ],
  exports: [
    PowerFactorTriangleComponent
  ]
})
export class PowerFactorTriangleModule { }
