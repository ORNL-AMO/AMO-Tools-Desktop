import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { CustomMaterialsComponent } from './custom-materials/custom-materials.component';
import { CustomFlueGasMaterialsComponent } from './custom-materials/custom-flue-gas-materials/custom-flue-gas-materials.component';
import { CustomGasLoadChargeMaterialsComponent } from './custom-materials/custom-gas-load-charge-materials/custom-gas-load-charge-materials.component';
import { CustomLiquidLoadChargeMaterialsComponent } from './custom-materials/custom-liquid-load-charge-materials/custom-liquid-load-charge-materials.component';
import { CustomSolidLoadChargeMaterialsComponent } from './custom-materials/custom-solid-load-charge-materials/custom-solid-load-charge-materials.component';
import { CustomSolidLiquidFlueGasMaterialsComponent } from './custom-materials/custom-solid-liquid-flue-gas-materials/custom-solid-liquid-flue-gas-materials.component';
import { CustomAtmosphereSpecificHeatMaterialsComponent } from './custom-materials/custom-atmosphere-specific-heat-materials/custom-atmosphere-specific-heat-materials.component';
import { CustomWallLossesSurfacesComponent } from './custom-materials/custom-wall-losses-sufaces/custom-wall-losses-surfaces.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CustomMaterialsService } from './custom-materials/custom-materials.service';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ModalModule,
        SharedPipesModule
    ],
    providers: [
        SuiteDbService,
        CustomMaterialsService
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
        CustomLiquidLoadChargeMaterialsComponent,
        CustomSolidLoadChargeMaterialsComponent,
        CustomSolidLiquidFlueGasMaterialsComponent,
        CustomAtmosphereSpecificHeatMaterialsComponent,
        CustomWallLossesSurfacesComponent,
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
        CustomMaterialsComponent,
    ]
})

export class SuiteDbModule { }
