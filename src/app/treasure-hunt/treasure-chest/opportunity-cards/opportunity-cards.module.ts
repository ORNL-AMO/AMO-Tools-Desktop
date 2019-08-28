import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityCardsComponent } from './opportunity-cards.component';
import { CompressedAirPressureReductionCardComponent } from './compressed-air-pressure-reduction-card/compressed-air-pressure-reduction-card.component';
import { LightingReplacementCardComponent } from './lighting-replacement-card/lighting-replacement-card.component';
import { MotorDriveCardComponent } from './motor-drive-card/motor-drive-card.component';
import { NaturalGasReductionCardComponent } from './natural-gas-reduction-card/natural-gas-reduction-card.component';
import { OpportunitySheetCardComponent } from './opportunity-sheet-card/opportunity-sheet-card.component';
import { ReplaceExistingMotorCardComponent } from './replace-existing-motor-card/replace-existing-motor-card.component';
import { WaterReductionCardComponent } from './water-reduction-card/water-reduction-card.component';
import { CompressedAirReductionCardComponent } from './compressed-air-reduction-card/compressed-air-reduction-card.component';
import { ElectricityReductionCardComponent } from './electricity-reduction-card/electricity-reduction-card.component';
import { OpportunityCardsService } from './opportunity-cards.service';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    OpportunityCardsComponent,
    CompressedAirPressureReductionCardComponent,
    CompressedAirReductionCardComponent,
    ElectricityReductionCardComponent,
    LightingReplacementCardComponent,
    MotorDriveCardComponent,
    NaturalGasReductionCardComponent,
    OpportunitySheetCardComponent,
    ReplaceExistingMotorCardComponent,
    WaterReductionCardComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    OpportunityCardsComponent
  ],
  providers: [
    OpportunityCardsService
  ]
})
export class OpportunityCardsModule { }
