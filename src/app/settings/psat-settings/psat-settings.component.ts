import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-psat-settings',
  templateUrl: './psat-settings.component.html',
  styleUrls: ['./psat-settings.component.css']
})
export class PsatSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;
  @Input()
  unitChange: boolean;

  flowMeasurements: Array<any> = [];
  powerMeasurements: Array<any> = [];
  distanceMeasurements: Array<any> = [];
  pressureMeasurements: Array<any> = [];



  isFirstChange: boolean = true;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.flowMeasurements = new Array();
    this.distanceMeasurements = new Array();
    this.pressureMeasurements = new Array();
    this.powerMeasurements = new Array();
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
      this.distanceMeasurements.push(tmpPossibility);
    })
    tmpList = this.convertUnitsService.possibilities('power');
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.powerMeasurements.push(tmpPossibility);
    })
    tmpList = this.convertUnitsService.possibilities('pressure');
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.pressureMeasurements.push(tmpPossibility);
    })
  }

  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }

  setCustom() {
    this.settingsForm.patchValue({
      unitsOfMeasure: 'Custom'
    })
  }
}
