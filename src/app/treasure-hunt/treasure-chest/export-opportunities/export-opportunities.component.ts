import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities, LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, NaturalGasReductionTreasureHunt, MotorDriveInputsTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, SteamReductionTreasureHunt } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { ImportExportService } from '../../../dashboard/import-export/import-export.service';
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

  ngOnDestroy(){
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
      waterReductions: this.getSelectedWaterReductions(this.treasureHunt.waterReductions)
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

  exportData() {
    this.importExportService.downloadOpportunities(this.exportOpportunities, this.exportName);
    this.hideExportModal();
  }
}
