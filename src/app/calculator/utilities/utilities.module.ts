import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from  '../../shared/shared.module';
import { UtilitiesComponent } from './utilities.component';
import { UnitConverterComponent } from './unit-converter/unit-converter.component';
import { SortByPipe } from './unit-converter/sort-by.pipe';

import { CombinedHeatPowerModule } from './combined-heat-power/combined-heat-power.module';

import { CashFlowComponent } from './cash-flow/cash-flow.component';
import { CashFlowHelpComponent } from './cash-flow/cash-flow-help/cash-flow-help.component';
import { CashFlowFormComponent } from './cash-flow/cash-flow-form/cash-flow-form.component';
import { CashFlowDiagramComponent } from './cash-flow/cash-flow-diagram/cash-flow-diagram.component';

@NgModule({
    declarations: [
        UtilitiesComponent,
        UnitConverterComponent,
        SortByPipe,
        CashFlowComponent,
        CashFlowHelpComponent,
        CashFlowFormComponent,
        CashFlowDiagramComponent
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
        SharedModule,
        CombinedHeatPowerModule
    ],
    providers: [
    ]

})

export class UtilitiesModule {}
