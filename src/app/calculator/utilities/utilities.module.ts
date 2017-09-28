import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from  '../../shared/shared.module';
import { UtilitiesComponent } from './utilities.component';
import { UnitConverterComponent } from './unit-converter/unit-converter.component';
import { SortByPipe } from './unit-converter/sort-by.pipe';
import { CashFlowComponent } from './cash-flow/cash-flow.component';
@NgModule({
    declarations: [
        UtilitiesComponent,
        UnitConverterComponent,
        SortByPipe,
        CashFlowComponent
    ],
    exports: [
        UnitConverterComponent,
        UtilitiesComponent,
        CashFlowComponent
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
