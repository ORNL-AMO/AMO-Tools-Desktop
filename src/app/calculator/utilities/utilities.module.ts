import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from  '../../shared/shared.module';
import { UtilitiesComponent } from './utilities.component';
import { UnitConverterComponent } from './unit-converter/unit-converter.component';

@NgModule({
    declarations: [
        UtilitiesComponent,
        UnitConverterComponent
    ],
    exports: [
        UnitConverterComponent,
        UtilitiesComponent
    ], 
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule
    ],
    providers: [

    ]


})

export class UtilitiesModule {}