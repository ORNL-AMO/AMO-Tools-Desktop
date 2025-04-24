import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from "@angular/forms";

@Component({
    selector: 'app-steam-settings',
    templateUrl: './steam-settings.component.html',
    styleUrls: ['./steam-settings.component.css'],
    standalone: false
})
export class SteamSettingsComponent implements OnInit {
  @Input()
  settingsForm: UntypedFormGroup;

  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();

  pressureMeasurements: Array<any> = [];
  temperatureMeasurements: Array<any> = [];
  steamSpecificEnthalpyMeasurements: Array<any> = [];
  steamSpecificEntropyMeasurements: Array<any> = [];
  specificVolumeMeasurements: Array<any> = [];
  steamMassFlowMeasurements: Array<any> = [];
  steamEnergyMeasurements: Array<any> = [];
  steamPowerMeasurements: Array<any> = [];
  steamVolumeMeasurements: Array<any> = [];
  steamVolumeFlowMeasurements: Array<any> = [];
  steamVacuumPreasureMeasurements: Array<any> = [];
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
    this.steamPowerMeasurements = new Array();
    this.steamVolumeMeasurements = new Array();
    this.steamVolumeFlowMeasurements = new Array();
    this.steamVacuumPreasureMeasurements = new Array();
    //pressureMeasurements
    let tmpList = [
      'kPaa',
      'kPag',
      'psia',
      'psig',
      'barg',
      'bara',
      'MPa',
      'MPaa'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.pressureMeasurements.push(tmpPossibility);
    });

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
      };
      this.temperatureMeasurements.push(tmpPossibility);
    });

    //specificEnthalpyMeasurements
    tmpList = [
      'btuLb',
      'kJkg'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamSpecificEnthalpyMeasurements.push(tmpPossibility);
    });

    //specificEntropyMeasurements
    tmpList = [
      'btulbF',
      'kJkgK'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamSpecificEntropyMeasurements.push(tmpPossibility);
    });

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
      };
      this.specificVolumeMeasurements.push(tmpPossibility);
    });

    //massFlowMeasurements
    tmpList = [
      'klb',
      'tonne',
      'kg'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamMassFlowMeasurements.push(tmpPossibility);
    });

    //steamEnergyMeasurements
    tmpList = [
      'MMBtu',
      'Btu',
      'GJ',
      'kJ',
      'kcal',
      'kgce',
      'kgoe',
      'kWh',
      'MJ'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamEnergyMeasurements.push(tmpPossibility);
    });

    tmpList = [
      'kW',
      'MJh',
      'GJh',
      'kJh'
    ];

    tmpList.forEach(unit => {

      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamPowerMeasurements.push(tmpPossibility);
    });

    //steam vacuum
    tmpList = [
      'kPaa',
      'kPag',
      'psia',
      'psig',
      'barg',
      'bara',
      'MPa',
      'MPaa'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamVacuumPreasureMeasurements.push(tmpPossibility);
    });
    //steam volume
    tmpList = [
      'gal',
      'L',
      'm3'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamVolumeMeasurements.push(tmpPossibility);
    });
    //steam volume flow
    tmpList = [
      'gpm',
      'L/min',
      'm3/min'
    ];
    tmpList.forEach(unit => {
      let tmpPossibility = {
        unit: unit,
        display: this.getUnitName(unit)
      };
      this.steamVolumeFlowMeasurements.push(tmpPossibility);
    });
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

  getPowerDisplay(unit: any) {
    if (unit) {
      if (unit === 'kWh') {
        return '(kW)';
      } else {
        return this.convertUnitsService.getUnit(unit).unit.name.display;
      }
    }
  }

}
