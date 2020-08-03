import { Injectable } from '@angular/core';
import { SteamPropertiesService, IsobarCoordinates, IsothermCoordinates } from './steam-properties.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable({
  providedIn: 'root'
})
export class SteamPropertiesConversionService {

  constructor(private steamPropertiesService: SteamPropertiesService, private convertUnitsService: ConvertUnitsService) { }

  convertIsobarTemperature(settings: Settings, defaultTempUnit) {
    let isobars = this.steamPropertiesService.isobars.getValue();
    this.steamPropertiesService.temperatures = this.convertArray(this.steamPropertiesService.temperatures, defaultTempUnit, settings.steamTemperatureMeasurement);
    isobars.map((line: IsobarCoordinates) => {
      line.temp = this.convertArray(line.temp, defaultTempUnit, settings.steamTemperatureMeasurement);
    });
    this.steamPropertiesService.isobars.next(isobars);
  }

  convertIsobarEntropy(settings: Settings, defaultEntropyUnit) {
    let isobars = this.steamPropertiesService.isobars.getValue();
    this.steamPropertiesService.entropy = this.convertArray(this.steamPropertiesService.entropy, defaultEntropyUnit, settings.steamSpecificEntropyMeasurement);
    isobars.map((line: IsobarCoordinates) => {
      line.entropy = this.convertArray(line.entropy, defaultEntropyUnit, settings.steamSpecificEntropyMeasurement);
    });
    this.steamPropertiesService.isobars.next(isobars);
  }

  convertIsobarPressure(settings: Settings, defaultPressureUnit) {
    let isobars = this.steamPropertiesService.isobars.getValue();
    isobars.map((line: IsobarCoordinates) => {
      let converted = this.convertVal(line.pressureValue, defaultPressureUnit, settings.steamPressureMeasurement);
      converted = this.roundVal(converted, 2);
      line.pressureValue = converted;

    });
    this.steamPropertiesService.isobars.next(isobars);
  }

  convertIsothermPressure(settings: Settings, defaultPressureUnit: string, conversionUnit: string) {
    let isotherms = this.steamPropertiesService.isotherms.getValue();
    this.steamPropertiesService.pressures = this.convertArray(this.steamPropertiesService.pressures, defaultPressureUnit, conversionUnit);
    isotherms.map((line: IsothermCoordinates) => {
      line.pressure = this.convertArray(line.pressure, defaultPressureUnit, conversionUnit);
    });
    this.steamPropertiesService.isotherms.next(isotherms);
  }

  convertIsothermEnthalpy(settings: Settings, defaultEnthalpyUnit) {
    let isotherms = this.steamPropertiesService.isotherms.getValue();
    this.steamPropertiesService.enthalpy = this.convertArray(this.steamPropertiesService.enthalpy, defaultEnthalpyUnit, settings.steamSpecificEnthalpyMeasurement);
    isotherms.map((line: IsothermCoordinates) => {
      line.enthalpy = this.convertArray(line.enthalpy, defaultEnthalpyUnit, settings.steamSpecificEnthalpyMeasurement);
    });
    this.steamPropertiesService.isotherms.next(isotherms);
  }

  convertVaporQualities(defaultUnit, conversionUnit, isPressure = false) {
    let qualities = this.steamPropertiesService.vaporQualities.getValue();
    qualities.map((quality: IsothermCoordinates) => {
      if (isPressure) {
        quality.pressure = this.convertArray(quality.pressure, defaultUnit, conversionUnit);
      } else {
        quality.enthalpy = this.convertArray(quality.enthalpy, defaultUnit, conversionUnit);
      }
    });
    this.steamPropertiesService.vaporQualities.next(qualities);
  }

  convertArray(oldArray: Array<number>, from: string, to: string): Array<number> {
    let convertedArray = new Array<number>();
    for (let i = 0; i < oldArray.length; i++) {
      convertedArray.push(this.convertVal(oldArray[i], from, to));
    }

    return convertedArray;
  }

  convertVal(val: number, from: string, to: string) {
    if (val !== undefined) {
      val = this.convertUnitsService.value(val).from(from).to(to);
    }

    return val;
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
}
