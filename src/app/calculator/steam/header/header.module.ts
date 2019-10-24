import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderFormComponent } from './header-form/header-form.component';
import { HeaderHelpComponent } from './header-help/header-help.component';
import { HeaderResultsComponent } from './header-results/header-results.component';
import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';
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
  declarations: [HeaderFormComponent, HeaderHelpComponent, HeaderResultsComponent, HeaderComponent],
  providers: [HeaderService],
  exports: [HeaderComponent]
})
export class HeaderModule { }
