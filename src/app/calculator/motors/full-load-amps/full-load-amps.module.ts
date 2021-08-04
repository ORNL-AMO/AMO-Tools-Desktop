import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullLoadAmpsComponent } from './full-load-amps.component';
import { FullLoadAmpsFormComponent } from './full-load-amps-form/full-load-amps-form.component';
import { FullLoadAmpsHelpComponent } from './full-load-amps-help/full-load-amps-help.component';
import { FullLoadAmpsService } from './full-load-amps.service';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [FullLoadAmpsComponent, FullLoadAmpsFormComponent, FullLoadAmpsHelpComponent],
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  providers: [FullLoadAmpsService],
  exports: [FullLoadAmpsComponent]
})
export class FullLoadAmpsModule { }
