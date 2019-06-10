import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplaceRewindComponent } from './replace-rewind.component';
import { ReplaceRewindFormComponent } from './replace-rewind-form/replace-rewind-form.component';
import { ReplaceRewindResultsComponent } from './replace-rewind-results/replace-rewind-results.component';
import { ReplaceRewindHelpComponent } from './replace-rewind-help/replace-rewind-help.component';
import { ReplaceRewindService } from './replace-rewind.service';
import { SharedModule } from '../../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ReplaceRewindComponent, ReplaceRewindFormComponent, ReplaceRewindResultsComponent, ReplaceRewindHelpComponent],
  providers: [
    ReplaceRewindService
  ],
  exports: [
    ReplaceRewindComponent
  ]
})
export class ReplaceRewindModule { }
