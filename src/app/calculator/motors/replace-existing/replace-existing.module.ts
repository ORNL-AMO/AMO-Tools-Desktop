import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplaceExistingComponent } from './replace-existing.component';
import { ReplaceExistingFormComponent } from './replace-existing-form/replace-existing-form.component';
import { ReplaceExistingHelpComponent } from './replace-existing-help/replace-existing-help.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ReplaceExistingService } from './replace-existing.service';
import { ReplaceExistingResultsComponent } from './replace-existing-results/replace-existing-results.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    ReplaceExistingService
  ],
  declarations: [ReplaceExistingComponent, ReplaceExistingFormComponent, ReplaceExistingHelpComponent, ReplaceExistingResultsComponent],
  exports: [ReplaceExistingComponent]
})
export class ReplaceExistingModule { }
