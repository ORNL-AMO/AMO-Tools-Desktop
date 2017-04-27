import { Component, OnInit, Input } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-psat-settings',
  templateUrl: './psat-settings.component.html',
  styleUrls: ['./psat-settings.component.css']
})
export class PsatSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;


  flowMeasurements: Array<any> = []

  headMeasurements: Array<any> = []

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.flowMeasurements = new Array();
    this.headMeasurements = new Array();

    let tmpList = this.convertUnitsService.possibilities('volumeFlowRate');
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.flowMeasurements.push(tmpPossibility);
    })

    tmpList = this.convertUnitsService.possibilities('length');
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.headMeasurements.push(tmpPossibility);
    })
  }

  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }
}
