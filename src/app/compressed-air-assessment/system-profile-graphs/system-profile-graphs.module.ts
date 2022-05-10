import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemProfileGraphsComponent } from './system-profile-graphs.component';
import { SystemProfileGraphsService } from './system-profile-graphs.service';

@NgModule({
  declarations: [
    SystemProfileGraphsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SystemProfileGraphsComponent
  ],
  providers: [
    SystemProfileGraphsService
  ]
})
export class SystemProfileGraphsModule { }
