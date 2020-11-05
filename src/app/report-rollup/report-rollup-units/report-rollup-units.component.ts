import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';
import { ReportItem } from '../report-rollup-models';
import { PhastReportRollupService } from '../phast-report-rollup.service';

@Component({
  selector: 'app-report-rollup-units',
  templateUrl: './report-rollup-units.component.html',
  styleUrls: ['./report-rollup-units.component.css']
})
export class ReportRollupUnitsComponent implements OnInit {
  @Input()
  settings: Settings;
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
    'kWh'
  ];
  energyResultOptions: Array<any>;
  phastAssessments: Array<ReportItem>;
  tmpSettings: Settings;
  assessmentsSub: Subscription;
  constructor(private convertUnitsService: ConvertUnitsService, private phastReportRollupService: PhastReportRollupService) { }

  ngOnInit() {
    this.tmpSettings = JSON.parse(JSON.stringify(this.settings));
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

  ngOnDestroy() {
    this.assessmentsSub.unsubscribe();
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
    this.settings.phastRollupElectricityUnit = this.tmpSettings.phastRollupElectricityUnit;
    this.settings.phastRollupFuelUnit = this.tmpSettings.phastRollupFuelUnit;
    this.settings.phastRollupSteamUnit = this.tmpSettings.phastRollupSteamUnit;
    this.newUnit();
    this.closeUnitModal.emit(true);
  }

  newUnit() {
    let assessments = this.phastReportRollupService.phastAssessments.getValue();
    this.phastReportRollupService.phastAssessments.next(assessments);
  }
}
