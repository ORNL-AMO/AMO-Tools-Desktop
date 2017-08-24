import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuiteDbService } from './suite-db.service';
import { FlueGasMaterialComponent } from './flue-gas-material/flue-gas-material.component';
import { GasLoadChargeMaterialComponent } from './gas-load-charge-material/gas-load-charge-material.component';
import { LiquidLoadChargeMaterialComponent } from './liquid-load-charge-material/liquid-load-charge-material.component';
import { SolidLiquidFlueGasMaterialComponent } from './solid-liquid-flue-gas-material/solid-liquid-flue-gas-material.component';
import { SolidLoadChargeMaterialComponent } from './solid-load-charge-material/solid-load-charge-material.component';
@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule
    ],
    providers: [
        SuiteDbService
    ],
    declarations: [
        FlueGasMaterialComponent,
        GasLoadChargeMaterialComponent,
        LiquidLoadChargeMaterialComponent,
        SolidLiquidFlueGasMaterialComponent,
        SolidLoadChargeMaterialComponent
    ],
    exports: [
        GasLoadChargeMaterialComponent,
        SolidLoadChargeMaterialComponent,
        LiquidLoadChargeMaterialComponent,
        SolidLiquidFlueGasMaterialComponent,
        FlueGasMaterialComponent
    ]
})

export class SuiteDbModule { }