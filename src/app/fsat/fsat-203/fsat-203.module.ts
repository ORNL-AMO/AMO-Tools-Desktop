import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fsat203Component } from './fsat-203.component';
import { FsatBasicsComponent } from './fsat-basics/fsat-basics.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [Fsat203Component, FsatBasicsComponent],
  exports: [Fsat203Component]
})
export class Fsat203Module { }
