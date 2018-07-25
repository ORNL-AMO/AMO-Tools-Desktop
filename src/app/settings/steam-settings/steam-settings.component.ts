import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'app-steam-settings',
  templateUrl: './steam-settings.component.html',
  styleUrls: ['./steam-settings.component.css']
})
export class SteamSettingsComponent implements OnInit {
  @Input()
  settingsForm: FormGroup;

  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();

  pressureMeasurements: Array<any> = [];
  temperatureMeasurements: Array<any> = [];
  steamSpecificEnthalpyMeasurements: Array<any> = [];
  steamSpecificEntropyMeasurements: Array<any> = [];
  specificVolumeMeasurements: Array<any> = [];
  steamMassFlowMeasurements: Array<any> = [];
  steamEnergyMeasurements: Array<any> = [];

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    // this.startSavePolling.emit(false);
    this.pressureMeasurements = new Array();
    this.temperatureMeasurements = new Array();
    this.steamSpecificEnthalpyMeasurements = new Array();
    this.steamSpecificEntropyMeasurements = new Array();
    this.specificVolumeMeasurements = new Array();
    this.steamMassFlowMeasurements = new Array();
    this.steamEnergyMeasurements = new Array();
    //pressureMeasurements
    let tmpList = [
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

    //temperatureMeasurements
    tmpList = [
      'C',
      'F',
      'K',
      'R'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.temperatureMeasurements.push(tmpPossibility);
    })

    //specificEnthalpyMeasurements
    tmpList = [
      'btuLb',
      'kJkg'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.steamSpecificEnthalpyMeasurements.push(tmpPossibility);
    })

    //specificEntropyMeasurements
    tmpList = [
      'btulbF',
      'kJkgK'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.steamSpecificEntropyMeasurements.push(tmpPossibility);
    })

    //specificVolumeMeasurements
    tmpList = [
      'ft3lb',
      'm3kg',
      'm3g'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.specificVolumeMeasurements.push(tmpPossibility);
    })

    //massFlowMeasurements
    tmpList = [
      'klb',
      'tonne'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.steamMassFlowMeasurements.push(tmpPossibility);
    })

    //steamEnergyMeasurements
    tmpList = [
      'MMBtu',
      'Btu',
      'GJ',
      'kJ',
      'kcal',
      'kgce',
      'kgoe',
      'kWh'
    ]
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      }
      this.steamEnergyMeasurements.push(tmpPossibility);
    })
  }

  save() {
    this.startSavePolling.emit(true);
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

}
