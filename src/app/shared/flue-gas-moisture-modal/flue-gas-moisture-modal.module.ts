import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiteDbModule } from '../../suiteDb/suiteDb.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';
import { FlueGasLossesMoistureComponent } from './flue-gas-moisture-modal/flue-gas-losses-moisture/flue-gas-losses-moisture.component';
import { FlueGasMoistureResultsComponent } from './flue-gas-moisture-modal/flue-gas-moisture-results/flue-gas-moisture-results.component';
import { FlueGasMoistureHelpComponent } from './flue-gas-moisture-modal/flue-gas-moisture-help/flue-gas-moisture-help.component';
import { FlueGasMoisturePanelComponent } from './flue-gas-moisture-modal/flue-gas-moisture-panel/flue-gas-moisture-panel.component';
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
      FlueGasLossesMoistureComponent,
      FlueGasMoistureResultsComponent,
      FlueGasMoistureHelpComponent,
      FlueGasMoisturePanelComponent,
      FlueGasMoistureModalComponent,
    ],
})
export class FlueGasMoistureModalModule { }
