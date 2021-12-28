import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ReportItem } from '../report-rollup-models';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import { CompressedAirReportRollupService } from '../compressed-air-report-rollup.service';

@Component({
  selector: 'app-report-rollup-units',
  templateUrl: './report-rollup-units.component.html',
  styleUrls: ['./report-rollup-units.component.css']
})
export class ReportRollupUnitsComponent implements OnInit {

  @Output('closeUnitModal')
  closeUnitModal = new EventEmitter<boolean>();
  energyOptions: Array<string> = [
    'MMBtu',
    'Btu',
    'GJ',
    'kJ',
    'kcal',
    'kgce',
    'kgoe',
    'kWh',
    'MWh'
  ];
  currencies: Array<string> = [
    '$',
    // '$k'
  ];
  energyResultOptions: Array<any>;
  phastAssessments: Array<ReportItem>;
  tmpSettings: Settings;
  settings: Settings;
  constructor(private convertUnitsService: ConvertUnitsService, 
    private phastReportRollupService: PhastReportRollupService,
    private reportRollupService: ReportRollupService, 
    private psatReportRollupService: PsatReportRollupService,
    private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService,
    private wasteWaterReportRollupService: WasteWaterReportRollupService,
    private compressedAirReportRollupService: CompressedAirReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.tmpSettings = JSON.parse(JSON.stringify(this.settings));
    this.checkForRollupUnits();
    this.energyResultOptions = new Array();

    this.energyOptions.forEach(val => {
      let tmpPossibility = {
        unit: val,
        display: this.getUnitName(val),
        displayUnit: this.getUnitDisplay(val)
      };
      this.energyResultOptions.push(tmpPossibility);
    });
  }

  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }

  getUnitDisplay(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }

  saveUnits() {
    this.settings.phastRollupUnit = this.tmpSettings.phastRollupUnit;
    this.settings.pumpsRollupUnit = this.tmpSettings.pumpsRollupUnit;
    this.settings.fansRollupUnit = this.tmpSettings.fansRollupUnit;
    this.settings.steamRollupUnit = this.tmpSettings.steamRollupUnit;
    this.settings.wasteWaterRollupUnit = this.tmpSettings.wasteWaterRollupUnit;
    this.settings.compressedAirRollupUnit = this.tmpSettings.compressedAirRollupUnit;
    this.settings.currency = this.tmpSettings.currency;
    this.settings.commonRollupUnit = this.tmpSettings.commonRollupUnit;
    this.reportRollupService.settings.next(this.settings);
    this.newUnit();
    this.closeUnitModal.emit(true);
  }

  newUnit() {
    let assessments = this.phastReportRollupService.phastAssessments.getValue();
    this.phastReportRollupService.phastAssessments.next(assessments);

    let psatAssessments = this.psatReportRollupService.psatAssessments.getValue();
    this.psatReportRollupService.psatAssessments.next(psatAssessments);

    let fsatAssessments = this.fsatReportRollupService.fsatAssessments.getValue();
    this.fsatReportRollupService.fsatAssessments.next(fsatAssessments);

    let ssmtAssessments = this.ssmtReportRollupService.ssmtAssessments.getValue();
    this.ssmtReportRollupService.ssmtAssessments.next(ssmtAssessments);

    let wasteWaterAssessments = this.wasteWaterReportRollupService.wasteWaterAssessments.getValue();
    this.wasteWaterReportRollupService.wasteWaterAssessments.next(wasteWaterAssessments);

    let compressedAirAssessments = this.compressedAirReportRollupService.compressedAirAssessments.getValue();
    this.compressedAirReportRollupService.compressedAirAssessments.next(compressedAirAssessments);
  }

  checkForRollupUnits() {
    this.tmpSettings.commonRollupUnit = this.settings.energyResultUnit;
    if (this.settings.unitsOfMeasure === 'Imperial') {
      if (!this.tmpSettings.pumpsRollupUnit) {
        this.tmpSettings.pumpsRollupUnit = 'MWh';
      }
      if (!this.tmpSettings.fansRollupUnit) {
        this.tmpSettings.fansRollupUnit = 'MWh';
      }
      if (!this.tmpSettings.steamRollupUnit) {
        this.tmpSettings.steamRollupUnit = 'MMBtu';
      }
      if (!this.tmpSettings.wasteWaterRollupUnit) {
        this.tmpSettings.wasteWaterRollupUnit = 'kWh';
      }
      if (!this.tmpSettings.compressedAirRollupUnit) {
        this.tmpSettings.compressedAirRollupUnit = 'kWh';
      }
    }
    if (this.settings.unitsOfMeasure === 'Metric') {
      if (!this.tmpSettings.pumpsRollupUnit) {
        this.tmpSettings.pumpsRollupUnit = 'MWh';
      }
      if (!this.tmpSettings.fansRollupUnit) {
        this.tmpSettings.fansRollupUnit = 'MWh';
      }
      if (!this.tmpSettings.steamRollupUnit) {
        this.tmpSettings.steamRollupUnit = 'GJ';
      }
      if (!this.tmpSettings.wasteWaterRollupUnit) {
        this.tmpSettings.wasteWaterRollupUnit = 'kWh';
      }
      if (!this.tmpSettings.compressedAirRollupUnit) {
        this.tmpSettings.compressedAirRollupUnit = 'kWh';
      }
    }

  }

}
