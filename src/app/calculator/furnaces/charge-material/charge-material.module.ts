import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChargeMaterialHelpComponent } from './charge-material-help/charge-material-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { ChargeMaterialService } from './charge-material.service';
import { GasMaterialFormComponent } from './gas-material-form/gas-material-form.component';
import { LiquidMaterialFormComponent } from './liquid-material-form/liquid-material-form.component';
import { SolidMaterialFormComponent } from './solid-material-form/solid-material-form.component';
import { ChargeMaterialComponent } from './charge-material.component';
import { SolidMaterialFormService } from './solid-material-form/solid-material-form.service';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { LiquidMaterialFormService } from './liquid-material-form/liquid-material-form.service';
import { GasMaterialFormService } from './gas-material-form/gas-material-form.service';



@NgModule({
  declarations: [
    ChargeMaterialHelpComponent,
    ChargeMaterialComponent,
    GasMaterialFormComponent,
    LiquidMaterialFormComponent,
    SolidMaterialFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    FlueGasModule
  ],
  exports: [
    ChargeMaterialComponent
  ],
  providers: [
    ChargeMaterialService,
    SolidMaterialFormService,
    LiquidMaterialFormService,
    GasMaterialFormService,
  ]
})
export class ChargeMaterialModule { }
