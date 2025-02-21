import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlueGasLossesComponent } from './flue-gas-losses.component';
import { FlueGasLossesFormVolumeComponent } from './flue-gas-losses-form-volume/flue-gas-losses-form-volume.component';
import { FlueGasLossesFormMassComponent } from "./flue-gas-losses-form-mass/flue-gas-losses-form-mass.component";
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { FlueGasMoistureModalModule } from '../../../shared/flue-gas-moisture-modal/flue-gas-moisture-modal.module';
import { FlueGasCompareService } from './flue-gas-compare.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SuiteDbModule,
    ModalModule,
    SharedPipesModule,
    FlueGasMoistureModalModule
  ],
  declarations: [
    FlueGasLossesComponent,
    FlueGasLossesFormMassComponent,
    FlueGasLossesFormVolumeComponent,
  ],
  providers: [
    FlueGasCompareService,
  ],
  exports: [
    FlueGasLossesComponent
  ]
})
export class FlueGasLossesModule { }
