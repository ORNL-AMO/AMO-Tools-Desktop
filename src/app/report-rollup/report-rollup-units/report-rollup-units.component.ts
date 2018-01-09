import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ReportRollupService } from '../report-rollup.service';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-report-rollup-units',
  templateUrl: './report-rollup-units.component.html',
  styleUrls: ['./report-rollup-units.component.css']
})
export class ReportRollupUnitsComponent implements OnInit {
  @Input()
  settings: Settings;

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
  phastAssessments: Array<Assessment>;
  constructor(private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.reportRollupService.phastAssessments.subscribe(val => {
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

  newUnit(){
    this.reportRollupService.phastAssessments.next(this.phastAssessments);
  }
}
