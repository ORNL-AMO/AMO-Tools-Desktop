import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullLoadAmpsComponent } from './full-load-amps.component';
import { FullLoadAmpsFormComponent } from './full-load-amps-form/full-load-amps-form.component';
import { FullLoadAmpsHelpComponent } from './full-load-amps-help/full-load-amps-help.component';



@NgModule({
  declarations: [FullLoadAmpsComponent, FullLoadAmpsFormComponent, FullLoadAmpsHelpComponent],
  imports: [
    CommonModule
  ],
  exports: [FullLoadAmpsComponent]
})
export class FullLoadAmpsModule { }
