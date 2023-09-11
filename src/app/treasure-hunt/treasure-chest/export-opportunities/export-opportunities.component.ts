import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities, LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, NaturalGasReductionTreasureHunt, MotorDriveInputsTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt, WallLossTreasureHunt, FlueGasTreasureHunt, LeakageLossTreasureHunt, OpeningLossTreasureHunt, WasteHeatTreasureHunt, WaterHeatingTreasureHunt, HeatCascadingTreasureHunt, AirHeatingTreasureHunt, CoolingTowerMakeupWaterTreasureHunt, ChillerStagingTreasureHunt, ChillerPerformanceTreasureHunt, CoolingTowerFanTreasureHunt, CoolingTowerBasinTreasureHunt } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
@Component({
  selector: 'app-export-opportunities',
  templateUrl: './export-opportunities.component.html',
  styleUrls: ['./export-opportunities.component.css']
})
export class ExportOpportunitiesComponent implements OnInit {
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  exportOpportunities: ImportExportOpportunities;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  exportName: string = 'Opportunites Data';
  constructor(private importExportService: ImportExportService, private treasureHuntService: TreasureHuntService,
    private treasureChestMenuService: TreasureChestMenuService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.setImportExportData();
    });
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.showExportModal();
  }

  showExportModal() {
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
    this.exportModal.onHidden.subscribe(val => {
      this.treasureChestMenuService.showExportModal.next(false);
    });
  }
  setImportExportData() {
    this.exportOpportunities = {
      lightingReplacements: this.getSelectedLighting(this.treasureHunt.lightingReplacements),
      opportunitySheets: this.getSelectedOpportunities(this.treasureHunt.opportunitySheets),
      replaceExistingMotors: this.getSelectedReplaceExistingMotors(this.treasureHunt.replaceExistingMotors),
      motorDrives: this.getSelectedMotorDrives(this.treasureHunt.motorDrives),
      naturalGasReductions: this.getSelectedNgReductions(this.treasureHunt.naturalGasReductions),
      electricityReductions: this.getSelectedElectricityReductions(this.treasureHunt.electricityReductions),
      compressedAirReductions: this.getSelectedCompressedAirReductions(this.treasureHunt.compressedAirReductions),
      compressedAirPressureReductions: this.getSelectedCompressedAirPressureReductions(this.treasureHunt.compressedAirPressureReductions),
      steamReductions: this.getSelectedSteamReductions(this.treasureHunt.steamReductions),
      waterReductions: this.getSelectedWaterReductions(this.treasureHunt.waterReductions),
      pipeInsulationReductions: this.getSelectedPipeInsulationReductions(this.treasureHunt.pipeInsulationReductions),
      tankInsulationReductions: this.getSelectedTankInsulationReductions(this.treasureHunt.tankInsulationReductions),
      airLeakSurveys: this.getSelectedAirLeakSurveys(this.treasureHunt.airLeakSurveys),
      airHeatingOpportunities: this.getSelectedAirHeatingOpportunities(this.treasureHunt.airHeatingOpportunities),
      openingLosses: this.getSelectedOpeningLosses(this.treasureHunt.openingLosses),
      wallLosses: this.getSelectedWallLosses(this.treasureHunt.wallLosses),
      leakageLosses: this.getSelectedLeakageLosses(this.treasureHunt.leakageLosses),
      flueGasLosses: this.getSelectedFlueGasLosses(this.treasureHunt.flueGasLosses),
      wasteHeatReductions: this.getSelectedWasteHeatReductions(this.treasureHunt.wasteHeatReductions),
      heatCascadingOpportunities: this.getHeatCascadingOpportunities(this.treasureHunt.heatCascadingOpportunities),
      waterHeatingOpportunities: this.getWaterHeatingOpportunities(this.treasureHunt.waterHeatingOpportunities),
      coolingTowerMakeupOpportunities: this.getCoolingTowerMakeupOpportunities(this.treasureHunt.coolingTowerMakeupOpportunities),
      chillerStagingOpportunities: this.getChillerStagingOpportunities(this.treasureHunt.chillerStagingOpportunities),
      chillerPerformanceOpportunities: this.getChillerPerformanceOpportunities(this.treasureHunt.chillerPerformanceOpportunities),
      coolingTowerFanOpportunities: this.getCoolingTowerFanOpportunities(this.treasureHunt.coolingTowerFanOpportunities),
      coolingTowerBasinOpportunities: this.getCoolingTowerBasinOpportunities(this.treasureHunt.coolingTowerBasinOpportunities)
    }
  }
  getSelectedLighting(lightingReplacements: Array<LightingReplacementTreasureHunt>): Array<LightingReplacementTreasureHunt> {
    if (lightingReplacements) {
      return _.filter(lightingReplacements, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedReplaceExistingMotors(motors: Array<ReplaceExistingMotorTreasureHunt>): Array<ReplaceExistingMotorTreasureHunt> {
    if (motors) {
      return _.filter(motors, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedMotorDrives(drives: Array<MotorDriveInputsTreasureHunt>): Array<MotorDriveInputsTreasureHunt> {
    if (drives) {
      return _.filter(drives, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedNgReductions(reductions: Array<NaturalGasReductionTreasureHunt>): Array<NaturalGasReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedElectricityReductions(reductions: Array<ElectricityReductionTreasureHunt>): Array<ElectricityReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedCompressedAirReductions(reductions: Array<CompressedAirReductionTreasureHunt>): Array<CompressedAirReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedOpportunities(opportunities: Array<OpportunitySheet>): Array<OpportunitySheet> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedCompressedAirPressureReductions(reductions: Array<CompressedAirPressureReductionTreasureHunt>): Array<CompressedAirPressureReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedWaterReductions(reductions: Array<WaterReductionTreasureHunt>): Array<WaterReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedSteamReductions(reductions: Array<SteamReductionTreasureHunt>): Array<SteamReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedPipeInsulationReductions(reductions: Array<PipeInsulationReductionTreasureHunt>): Array<PipeInsulationReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getSelectedTankInsulationReductions(reductions: Array<TankInsulationReductionTreasureHunt>): Array<TankInsulationReductionTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedFlueGasLosses(losses: Array<FlueGasTreasureHunt>): Array<FlueGasTreasureHunt> {
    if (losses) {
      return _.filter(losses, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedAirLeakSurveys(reductions: Array<AirLeakSurveyTreasureHunt>): Array<AirLeakSurveyTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getSelectedOpeningLosses(losses: Array<OpeningLossTreasureHunt>): Array<OpeningLossTreasureHunt> {
    if (losses) {
      return _.filter(losses, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getSelectedWallLosses(losses: Array<WallLossTreasureHunt>): Array<WallLossTreasureHunt> {
    if (losses) {
      return _.filter(losses, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getSelectedAirHeatingOpportunities(airHeating: Array<AirHeatingTreasureHunt>): Array<AirHeatingTreasureHunt> {
    if (airHeating) {
      return _.filter(airHeating, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getSelectedLeakageLosses(losses: Array<LeakageLossTreasureHunt>): Array<LeakageLossTreasureHunt> {
    if (losses) {
      return _.filter(losses, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getSelectedWasteHeatReductions(reductions: Array<WasteHeatTreasureHunt>): Array<WasteHeatTreasureHunt> {
    if (reductions) {
      return _.filter(reductions, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getHeatCascadingOpportunities(opportunities: Array<HeatCascadingTreasureHunt>): Array<HeatCascadingTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getWaterHeatingOpportunities(opportunities: Array<WaterHeatingTreasureHunt>): Array<WaterHeatingTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }
  getCoolingTowerMakeupOpportunities(opportunities: Array<CoolingTowerMakeupWaterTreasureHunt>): Array<CoolingTowerMakeupWaterTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getChillerStagingOpportunities(opportunities: Array<ChillerStagingTreasureHunt>): Array<ChillerStagingTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getChillerPerformanceOpportunities(opportunities: Array<ChillerPerformanceTreasureHunt>): Array<ChillerPerformanceTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getCoolingTowerFanOpportunities(opportunities: Array<CoolingTowerFanTreasureHunt>): Array<CoolingTowerFanTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }

  getCoolingTowerBasinOpportunities(opportunities: Array<CoolingTowerBasinTreasureHunt>): Array<CoolingTowerBasinTreasureHunt> {
    if (opportunities) {
      return _.filter(opportunities, (opportunity) => { return opportunity.selected });
    }
    return undefined;
  }


  exportData() {
    this.importExportService.downloadOpportunities(this.exportOpportunities, this.exportName);
    this.hideExportModal();
  }
}
