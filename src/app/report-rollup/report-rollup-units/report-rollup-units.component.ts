import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ReportRollupService, ReportItem } from '../report-rollup.service';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';

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
  ]
  energyResultOptions: Array<any>;
  phastAssessments: Array<ReportItem>;
  tmpSettings: Settings;
  assessmentsSub: Subscription;
  constructor(private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.tmpSettings = JSON.parse(JSON.stringify(this.settings));
    this.assessmentsSub = this.reportRollupService.phastAssessments.subscribe(val => {
      this.phastAssessments = val;
    })

    this.energyResultOptions = new Array()

    this.energyOptions.forEach(val => {
      let tmpPossibility = {
        unit: val,
        display: this.getUnitName(val),
        displayUnit: this.getUnitDisplay(val)
      }
      this.energyResultOptions.push(tmpPossibility);
    })
  }

  ngOnDestroy(){
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

  saveUnits(){
    this.settings.phastRollupUnit = this.tmpSettings.phastRollupUnit;
    this.settings.phastRollupElectricityUnit = this.tmpSettings.phastRollupElectricityUnit;
    this.settings.phastRollupFuelUnit = this.tmpSettings.phastRollupFuelUnit;
    this.settings.phastRollupSteamUnit = this.tmpSettings.phastRollupSteamUnit;
    this.newUnit();
    this.closeUnitModal.emit(true);
  }

  newUnit(){
    this.reportRollupService.phastAssessments.next(this.phastAssessments);
  }
}
