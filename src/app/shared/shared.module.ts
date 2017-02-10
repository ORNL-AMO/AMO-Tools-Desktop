import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { ValidationService } from './validation.service';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule
  ],
  declarations: [
    ControlMessagesComponent
  ],
  exports: [
    ControlMessagesComponent
  ],
  providers: [
    ValidationService
  ]
})

export class SharedModule { }
