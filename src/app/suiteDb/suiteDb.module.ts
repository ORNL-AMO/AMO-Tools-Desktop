import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuiteDbService } from './suite-db.service';
import { FlueGasMaterialComponent } from './flue-gas-material/flue-gas-material.component';
import { GasLoadChargeMaterialComponent } from './gas-load-charge-material/gas-load-charge-material.component';
import { LiquidLoadChargeMaterialComponent } from './liquid-load-charge-material/liquid-load-charge-material.component';
import { SolidLiquidFlueGasMaterialComponent } from './solid-liquid-flue-gas-material/solid-liquid-flue-gas-material.component';
import { SolidLoadChargeMaterialComponent } from './solid-load-charge-material/solid-load-charge-material.component';
import { AtmosphereSpecificHeatMaterialComponent } from './atmosphere-specific-heat-material/atmosphere-specific-heat-material.component';
import { WallLossesSurfaceComponent } from './wall-losses-surface/wall-losses-surface.component';
import { FlueGasMaterialHelpComponent } from './flue-gas-material/flue-gas-material-help/flue-gas-material-help.component';
import { SolidLiquidFlueGasMaterialHelpComponent } from './solid-liquid-flue-gas-material/solid-liquid-flue-gas-material-help/solid-liquid-flue-gas-material-help.component';
import { GasLoadChargeMaterialHelpComponent } from './gas-load-charge-material/gas-load-charge-material-help/gas-load-charge-material-help.component';
import { LiquidLoadChargeMaterialHelpComponent } from './liquid-load-charge-material/liquid-load-charge-material-help/liquid-load-charge-material-help.component';
import { SolidLoadChargeMaterialHelpComponent } from './solid-load-charge-material/solid-load-charge-material-help/solid-load-charge-material-help.component';
import { WallLossesSurfaceHelpComponent } from './wall-losses-surface/wall-losses-surface-help/wall-losses-surface-help.component';
import { AtmosphereSpecificHeatMaterialHelpComponent } from './atmosphere-specific-heat-material/atmosphere-specific-heat-material-help/atmosphere-specific-heat-material-help.component';
import { SharedModule } from "../shared/shared.module";
import { CustomMaterialsComponent } from './custom-materials/custom-materials.component';
import { CustomFlueGasMaterialsComponent } from './custom-materials/custom-flue-gas-materials/custom-flue-gas-materials.component';
import { CustomGasLoadChargeMaterialsComponent } from './custom-materials/custom-gas-load-charge-materials/custom-gas-load-charge-materials.component';
@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule
    ],
    providers: [
        SuiteDbService
    ],
    declarations: [
        FlueGasMaterialComponent,
        GasLoadChargeMaterialComponent,
        LiquidLoadChargeMaterialComponent,
        SolidLiquidFlueGasMaterialComponent,
        SolidLoadChargeMaterialComponent,
        AtmosphereSpecificHeatMaterialComponent,
        WallLossesSurfaceComponent,
        FlueGasMaterialHelpComponent,
        SolidLiquidFlueGasMaterialHelpComponent,
        GasLoadChargeMaterialHelpComponent,
        LiquidLoadChargeMaterialHelpComponent,
        SolidLoadChargeMaterialHelpComponent,
        WallLossesSurfaceHelpComponent,
        AtmosphereSpecificHeatMaterialHelpComponent,
        CustomMaterialsComponent,
        CustomFlueGasMaterialsComponent,
        CustomGasLoadChargeMaterialsComponent,
    ],
    exports: [
        GasLoadChargeMaterialComponent,
        SolidLoadChargeMaterialComponent,
        LiquidLoadChargeMaterialComponent,
        SolidLiquidFlueGasMaterialComponent,
        FlueGasMaterialComponent,
        AtmosphereSpecificHeatMaterialComponent,
        WallLossesSurfaceComponent,
        FlueGasMaterialHelpComponent,
        SolidLiquidFlueGasMaterialHelpComponent,
        CustomMaterialsComponent
    ]
})

export class SuiteDbModule { }
