import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlueGasLossesComponent } from './flue-gas-losses.component';
import { FlueGasLossesFormVolumeComponent } from './flue-gas-losses-form-volume/flue-gas-losses-form-volume.component';
import { FlueGasLossesMoistureComponent } from './flue-gas-losses-moisture/flue-gas-losses-moisture.component';
import { FlueGasLossesFormMassComponent } from "./flue-gas-losses-form-mass/flue-gas-losses-form-mass.component";
import { FlueGasCompareService } from "./flue-gas-compare.service";
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { ModalModule } from 'ngx-bootstrap';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { FlueGasMoistureResultsComponent } from './flue-gas-moisture-results/flue-gas-moisture-results.component';
import { FlueGasMoistureHelpComponent } from './flue-gas-moisture-help/flue-gas-moisture-help.component';
import { FlueGasMoisturePanelComponent } from './flue-gas-moisture-panel/flue-gas-moisture-panel.component';
import { FlueGasMoistureModalComponent } from './flue-gas-moisture-modal/flue-gas-moisture-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SuiteDbModule,
    ModalModule,
    SharedPipesModule
  ],
  declarations: [
    FlueGasLossesComponent,
    FlueGasLossesFormMassComponent,
    FlueGasLossesFormVolumeComponent,
    FlueGasLossesMoistureComponent,
    FlueGasMoistureResultsComponent,
    FlueGasMoistureHelpComponent,
    FlueGasMoisturePanelComponent,
    FlueGasMoistureModalComponent,
  ],
  providers: [
    FlueGasCompareService,
  ],
  exports: [
    FlueGasLossesComponent
  ]
})
export class FlueGasLossesModule { }
