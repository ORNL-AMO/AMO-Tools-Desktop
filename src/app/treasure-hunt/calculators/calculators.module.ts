import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorsService } from './calculators.service';
import { CalculatorsComponent } from './calculators.component';
import { ReplaceExistingModule } from '../../calculator/motors/replace-existing/replace-existing.module';
import { MotorDriveModule } from '../../calculator/motors/motor-drive/motor-drive.module';
import { NaturalGasReductionModule } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.module';
import { ElectricityReductionModule } from '../../calculator/utilities/electricity-reduction/electricity-reduction.module';
import { WaterReductionModule } from '../../calculator/utilities/water-reduction/water-reduction.module';
import { LightingReplacementModule } from '../../calculator/lighting/lighting-replacement/lighting-replacement.module';
import { ModalModule } from 'ngx-bootstrap';

import { OpportunitySheetHelpComponent } from './standalone-opportunity-sheet/opportunity-sheet-help/opportunity-sheet-help.component';
import { OpportunitySheetResultsComponent } from './standalone-opportunity-sheet/opportunity-sheet-results/opportunity-sheet-results.component';
import { OpportunitySheetService } from './standalone-opportunity-sheet/opportunity-sheet.service';
import { OpportunitySheetComponent } from './opportunity-sheet/opportunity-sheet.component';
import { CostsFormComponent } from './opportunity-sheet/costs-form/costs-form.component';
import { GeneralDetailsFormComponent } from './opportunity-sheet/general-details-form/general-details-form.component';
import { StandaloneOpportunitySheetComponent } from './standalone-opportunity-sheet/standalone-opportunity-sheet.component';
import { EnergyUseFormComponent } from './standalone-opportunity-sheet/energy-use-form/energy-use-form.component';
import { FormsModule } from '@angular/forms';
import { PipeInsulationReductionModule } from '../../calculator/steam/pipe-insulation-reduction/pipe-insulation-reduction.module';
import { CompressedAirReductionModule } from '../../calculator/compressed-air/compressed-air-reduction/compressed-air-reduction.module';
import { CompressedAirPressureReductionModule } from '../../calculator/compressed-air/compressed-air-pressure-reduction/compressed-air-pressure-reduction.module';
import { SteamReductionModule } from '../../calculator/steam/steam-reduction/steam-reduction.module';
import { TankInsulationReductionModule } from '../../calculator/steam/tank-insulation-reduction/tank-insulation-reduction.module';
import { AirLeakModule } from '../../calculator/compressed-air/air-leak/air-leak.module';

@NgModule({
  declarations: [
    CalculatorsComponent,
    StandaloneOpportunitySheetComponent,
    OpportunitySheetHelpComponent,
    OpportunitySheetResultsComponent,
    EnergyUseFormComponent,
    CostsFormComponent,
    GeneralDetailsFormComponent,
    OpportunitySheetComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    ReplaceExistingModule,
    MotorDriveModule,
    NaturalGasReductionModule,
    ElectricityReductionModule,
    WaterReductionModule,
    CompressedAirPressureReductionModule,
    LightingReplacementModule,
    FormsModule,
    SteamReductionModule,
    PipeInsulationReductionModule,
    CompressedAirReductionModule,
    TankInsulationReductionModule,
    AirLeakModule
  ],
  providers: [
    CalculatorsService,
    OpportunitySheetService
  ],
  exports: [
    CalculatorsComponent,
    OpportunitySheetComponent,
  ]
})
export class CalculatorsModule { }
