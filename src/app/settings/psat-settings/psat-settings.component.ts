import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-psat-settings',
  templateUrl: './psat-settings.component.html',
  styleUrls: ['./psat-settings.component.css']
})
export class PsatSettingsComponent implements OnInit {
  @Input()
  settingsForm: FormGroup;
  @Input()
  unitChange: boolean;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();

  flowMeasurements: Array<any> = [];
  powerMeasurements: Array<any> = [];
  distanceMeasurements: Array<any> = [];
  pressureMeasurements: Array<any> = [];
  currentMeasurements: Array<any> = [];
  viscosityMeasurements: Array<any> = [];
  voltageMeasurements: Array<any> = [];
  temperatureMeasurements: Array<any> = [];
  isFirstChange: boolean = true;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.flowMeasurements = new Array();
    this.distanceMeasurements = new Array();
    this.pressureMeasurements = new Array();
    this.powerMeasurements = new Array();
    this.currentMeasurements = new Array();
    this.viscosityMeasurements = new Array();
    this.voltageMeasurements = new Array();
    this.temperatureMeasurements = new Array();
    let tmpList = [
      'gpm',
      'MGD',
      'm3/h',
      'L/s',
      'm3/min',
      'impgpm'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.flowMeasurements.push(tmpPossibility);
    })
    tmpList = [
      'm',
      'ft'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.distanceMeasurements.push(tmpPossibility);
    })
    tmpList = [
      'kW',
      'hp'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.powerMeasurements.push(tmpPossibility);
    })
    tmpList = [
      'kPa',
      'psi',
      'bar'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.pressureMeasurements.push(tmpPossibility);
    })

    tmpList = [
      'C',
      'F'
      // 'K'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.temperatureMeasurements.push(tmpPossibility);
    })
    // tmpList = this.convertUnitsService.possibilities('current');
    // tmpList.forEach(unit => {
    //   let tmpPossibility = {
    //     unit: unit,
    //     display: this.getUnitName(unit)
    //   }
    //   this.currentMeasurements.push(tmpPossibility);
    // })

    // tmpList = this.convertUnitsService.possibilities('viscosity');
    // tmpList.forEach(unit => {
    //   let tmpPossibility = {
    //     unit: unit,
    //     display: this.getUnitName(unit)
    //   }
    //   this.viscosityMeasurements.push(tmpPossibility);
    // })

    // tmpList = this.convertUnitsService.possibilities('voltage');
    // tmpList.forEach(unit => {
    //   let tmpPossibility = {
    //     unit: unit,
    //     display: this.getUnitName(unit)
    //   }
    //   this.voltageMeasurements.push(tmpPossibility);
    // })
  }

  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }

  getUnitDisplay(unit: any){
    if(unit){
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }

  setCustom() {
    this.settingsForm.patchValue({
      unitsOfMeasure: 'Custom'
    })

    this.startSavePolling.emit(true);
  }
}
