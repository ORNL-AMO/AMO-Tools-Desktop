import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from  '../../shared/shared.module';
import { UtilitiesComponent } from './utilities.component';
import { UnitConverterComponent } from './unit-converter/unit-converter.component';
import { SortByPipe } from './unit-converter/sort-by.pipe';
import { CombinedHeatPowerModule } from './combined-heat-power/combined-heat-power.module';
@NgModule({
    declarations: [
        UtilitiesComponent,
        UnitConverterComponent,
        SortByPipe
    ],
    exports: [
        UnitConverterComponent,
        UtilitiesComponent,
    ], 
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        CombinedHeatPowerModule
    ],
    providers: [
    ]

})

export class UtilitiesModule {}