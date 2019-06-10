import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreasureHunt, ImportExportOpportunities, LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, NaturalGasReductionTreasureHunt, MotorDriveInputsTreasureHunt } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
@Component({
  selector: 'app-import-export-opportunities',
  templateUrl: './import-export-opportunities.component.html',
  styleUrls: ['./import-export-opportunities.component.css']
})
export class ImportExportOpportunitiesComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitImportData')
  emitImportData = new EventEmitter<ImportExportOpportunities>();

  exportOpportunities: ImportExportOpportunities;
  fileReference: any;
  validFile: boolean;
  importJson = null;
  constructor(private importExportService: ImportExportService) { }

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


  exportData() {
    this.importExportService.downloadOpportunities(this.exportOpportunities, 'Opportunity Data');
  }

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.json$/;
        if (regex.test($event.target.files[0].name)) {
          this.fileReference = $event;
          let fr: FileReader = new FileReader();
          fr.readAsText($event.target.files[0]);
          fr.onloadend = (e) => {
            try {
              this.importJson = JSON.parse(JSON.stringify(fr.result));
              this.checkData(this.importJson);
            } catch (err) {
              this.validFile = false;
            }
          };
        } else {
          let fr: FileReader = new FileReader();
          fr.readAsText($event.target.files[0]);
          fr.onloadend = (e) => {
            try {
              this.importJson = JSON.parse(JSON.stringify(fr.result));
              this.checkData(this.importJson);
            } catch (err) {
              this.validFile = false;
            }
          };
        }
      }
    }
  }

  importFile() {
    if (!this.importJson) {
      let fr: FileReader = new FileReader();
      fr.readAsText(this.fileReference.target.files[0]);
      fr.onloadend = (e) => {
        this.importJson = JSON.parse(JSON.stringify(fr.result));
        this.emitImport(this.importJson);
      };
    }
    else {
      this.emitImport(this.importJson);
    }
  }

  checkData(data: any) {
    let importData = JSON.parse(data);
    console.log(importData.origin);
    if (importData.origin == 'AMO-TOOLS-DESKTOP-OPPORTUNITIES') {
      this.validFile = true;
    } else {
      this.validFile = false;
    }
  }

  emitImport(data: any) {
    let importData = JSON.parse(data);
    this.emitImportData.emit(importData);
  }
}
