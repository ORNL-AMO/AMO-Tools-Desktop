import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { WeatherBinsService } from '../weather-bins.service'; 
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-weather-bins-help',
    templateUrl: './weather-bins-help.component.html',
    styleUrls: ['./weather-bins-help.component.css'],
    standalone: false
})
export class WeatherBinsHelpComponent implements OnInit {
  @Input()
  settings: Settings;

  currentFieldSub: Subscription;
  currentField: string;

  fieldHelp: Array<{
    fieldName: string,
    min: number,
    max: number
  }>;
  constructor(private convertUnitsService: ConvertUnitsService, private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.setFieldHelp();
    this.currentFieldSub = this.weatherBinsService.currentField.subscribe(val => {
      if (val) this.currentField = val;
    });
  }

  setFieldHelp() {
    let dryBulbTempMin: number = -200;
    let dryBulbTempMax: number = 200;
    let wetBulbTempMin: number = -100;
    let wetBulbTempMax: number = 120;
    let dewPointMin: number = -200;
    let dewPointMax: number = 120;

    let temperatureUnit: string = 'F';
    let enthalpyUnit: string = 'btuLb';
    let atmPressureUnit: string = 'psia';
    let dewPointUnit: string = '';
    if (this.settings.unitsOfMeasure == 'Metric') {
      dryBulbTempMin = this.convertUnitsService.value(dryBulbTempMin).from('F').to('C');
      dryBulbTempMax = this.convertUnitsService.value(dryBulbTempMax).from('F').to('C');
      wetBulbTempMin = this.convertUnitsService.value(wetBulbTempMin).from('F').to('C');
      wetBulbTempMax = this.convertUnitsService.value(wetBulbTempMax).from('F').to('C');
      dewPointMin = this.convertUnitsService.value(dewPointMin).from('F').to('C');
      dewPointMax = this.convertUnitsService.value(dewPointMax).from('F').to('C');
      temperatureUnit = 'C';
      atmPressureUnit = 'Pa';
      enthalpyUnit = 'kJkg';
    }

    temperatureUnit = this.convertUnitsService.getUnit(temperatureUnit).unit.name.display;
    atmPressureUnit = this.convertUnitsService.getUnit(atmPressureUnit).unit.name.display;
    enthalpyUnit = this.convertUnitsService.getUnit(enthalpyUnit).unit.name.display;
    //TODO: add dew point once option is added
    this.fieldHelp = [
      {
        fieldName: 'Dry-bulb Temperature ' + temperatureUnit,
        min: dryBulbTempMin,
        max: dryBulbTempMax
      },
      {
        fieldName: 'Wet-bulb Temperature ' + temperatureUnit,
        min: wetBulbTempMin,
        max: wetBulbTempMax
      },
      {
        fieldName: 'Relative Humidity (%)',
        min: 0,
        max: 100
      },
      {
        fieldName: 'Enthalpy ' + enthalpyUnit,
        min: 0,
        max: undefined
      },
      // {
      //   fieldName: 'Dew Point ' + dewPointUnit,
      //   min: dewPointMin,
      //   max: dewPointMax
      // },
      {
        fieldName: 'Atm Pressure ' + atmPressureUnit,
        min: 0,
        max: undefined
      },
    ]
  }

}
