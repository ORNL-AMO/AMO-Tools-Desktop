import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-fsat-settings',
  templateUrl: './fsat-settings.component.html',
  styleUrls: ['./fsat-settings.component.css']
})
export class FsatSettingsComponent implements OnInit {
  @Input()
  settingsForm: FormGroup;
  @Output('save')
  save = new EventEmitter<boolean>();

  pressureMeasurements: Array<any> = [];
  flowMeasurements: Array<any> = [];
  powerMeasurements: Array<any> = [];
  densityMeasurements: Array<any> = [];
  temperatureMeasurements: Array<any> = [];
  barometricPressureMeasurements: Array<any> = [];
  specificHeatMeasurements: Array<any> = [];
  flowOptions: Array<string> = [
    'ft3/min',
    'm3/s'
  ];

  pressureOptions: Array<string> = [
    'Pa',
    'torr',
    'mmHg',
    'inHg',
    'mmH2o',
    'inH2o'
  ];
  powerOptions: Array<string> = [
    'kW',
    'hp'
  ];
  tempOptions: Array<string> = [
    'C',
    'F',
    'K',
    'R'
  ];

  densityOptions: Array<string> = [
    'kgNm3',
    'lbscf'
  ]

  barometricPressureOptions: Array<string> = [
    'kPaa',
    'inHg'
  ]

  specificHeatGasOptions: Array<string> = [
    'btulbF',
    'kJkgC'
  ]

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.flowOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.flowMeasurements.push(tmpPossibility);
    })
    this.pressureOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.pressureMeasurements.push(tmpPossibility);
    })
    this.powerOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.powerMeasurements.push(tmpPossibility);
    })
    this.tempOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.temperatureMeasurements.push(tmpPossibility);
    })
    this.densityOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.densityMeasurements.push(tmpPossibility);
    })

    this.barometricPressureOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.barometricPressureMeasurements.push(tmpPossibility);
    })

    this.specificHeatGasOptions.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.specificHeatMeasurements.push(tmpPossibility);
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
    this.emitSave();
  }

  emitSave() {
    this.save.emit(true);
  }

  getUnitDisplay(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }

}
