import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { ValidationService } from './validation.service';
import { ModelService } from './model.service';


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
    ValidationService,
    ModelService,

  ]
})

export class SharedModule { }
