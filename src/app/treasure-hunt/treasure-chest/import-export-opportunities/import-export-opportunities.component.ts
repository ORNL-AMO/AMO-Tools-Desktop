import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt, ImportExportOpportunities, LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, NaturalGasReductionTreasureHunt, MotorDriveInputsTreasureHunt } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
@Component({
  selector: 'app-import-export-opportunities',
  templateUrl: './import-export-opportunities.component.html',
  styleUrls: ['./import-export-opportunities.component.css']
})
export class ImportExportOpportunitiesComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;


  exportOpportunities: ImportExportOpportunities;
  constructor() { }

  ngOnInit() {
    this.setImportExportData();
  }

  setImportExportData() {
    this.exportOpportunities = {
      lightingReplacements: this.getSelectedLighting(this.treasureHunt.lightingReplacements),
      opportunitySheets: this.getSelectedOpportunities(this.treasureHunt.opportunitySheets),
      replaceExistingMotors: this.getSelectedReplaceExistingMotors(this.treasureHunt.replaceExistingMotors),
      motorDrives: this.getSelectedMotorDrives(this.treasureHunt.motorDrives),
      naturalGasReductions: this.getSelectedNgReductions(this.treasureHunt.naturalGasReductions),
      electricityReductions: this.getSelectedElectricityReductions(this.treasureHunt.electricityReductions),
      compressedAirReductions: this.getSelectedCompressedAirReductions(this.treasureHunt.compressedAirReductions)
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


  setImport(){
    
  }
}
