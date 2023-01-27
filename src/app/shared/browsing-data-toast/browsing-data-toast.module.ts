import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowsingDataToastComponent } from './browsing-data-toast.component';



@NgModule({
  declarations: [BrowsingDataToastComponent],
  imports: [
    CommonModule
  ],
  exports: [BrowsingDataToastComponent]
})
export class BrowsingDataToastModule { }
