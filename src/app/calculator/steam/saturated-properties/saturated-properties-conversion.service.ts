import { Injectable } from '@angular/core';
import { SaturatedPropertiesService, IsobarCoordinates, IsothermCoordinates } from './saturated-properties.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class SaturatedPropertiesConversionService {

  constructor(private saturatedPropertiesService: SaturatedPropertiesService, private convertUnitsService: ConvertUnitsService) { }

  convertIsobarTemperature(settings: Settings, defaultTempUnit) {
    let isobars = this.saturatedPropertiesService.isobars.getValue();
    this.saturatedPropertiesService.temperatures = this.convertArray(this.saturatedPropertiesService.temperatures, defaultTempUnit, settings.steamTemperatureMeasurement);
    isobars.map((line: IsobarCoordinates) => {
      line.temp = this.convertArray(line.temp, defaultTempUnit, settings.steamTemperatureMeasurement);
    });
    this.saturatedPropertiesService.isobars.next(isobars);
  }

  convertIsobarEntropy(settings: Settings, defaultEntropyUnit) {
    let isobars = this.saturatedPropertiesService.isobars.getValue();
    this.saturatedPropertiesService.entropy = this.convertArray(this.saturatedPropertiesService.entropy, defaultEntropyUnit, settings.steamSpecificEntropyMeasurement);
    isobars.map((line: IsobarCoordinates) => {
      line.entropy = this.convertArray(line.entropy, defaultEntropyUnit, settings.steamSpecificEntropyMeasurement);
    });
    this.saturatedPropertiesService.isobars.next(isobars);
  }

  convertIsobarPressure(settings: Settings, defaultPressureUnit) {
    let isobars = this.saturatedPropertiesService.isobars.getValue();
    isobars.map((line: IsobarCoordinates) => {
      let converted = this.convertVal(line.pressureValue, defaultPressureUnit, settings.steamPressureMeasurement);
      converted = this.roundVal(converted, 2);
      line.pressureValue = converted;

    });
    this.saturatedPropertiesService.isobars.next(isobars);
  }

  convertIsothermPressure(settings: Settings, defaultPressureUnit: string, conversionUnit: string) {
    let isotherms = this.saturatedPropertiesService.isotherms.getValue();
    this.saturatedPropertiesService.pressures = this.convertArray(this.saturatedPropertiesService.pressures, defaultPressureUnit, conversionUnit);
    isotherms.map((line: IsothermCoordinates) => {
      line.pressure = this.convertArray(line.pressure, defaultPressureUnit, conversionUnit);
    });
    this.saturatedPropertiesService.isotherms.next(isotherms);
  }

  convertIsothermEnthalpy(settings: Settings, defaultEnthalpyUnit) {
    let isotherms = this.saturatedPropertiesService.isotherms.getValue();
    this.saturatedPropertiesService.enthalpy = this.convertArray(this.saturatedPropertiesService.enthalpy, defaultEnthalpyUnit, settings.steamSpecificEnthalpyMeasurement);
    isotherms.map((line: IsothermCoordinates) => {
      line.enthalpy = this.convertArray(line.enthalpy, defaultEnthalpyUnit, settings.steamSpecificEnthalpyMeasurement);
    });
    this.saturatedPropertiesService.isotherms.next(isotherms);
  }

  convertVaporQualities(defaultUnit, conversionUnit, isPressure = false) {
    let qualities = this.saturatedPropertiesService.vaporQualities.getValue();
    qualities.map((quality: IsothermCoordinates) => {
      if (isPressure) {
        quality.pressure = this.convertArray(quality.pressure, defaultUnit, conversionUnit);
      } else {
        quality.enthalpy = this.convertArray(quality.enthalpy, defaultUnit, conversionUnit);
      }
    });
    this.saturatedPropertiesService.vaporQualities.next(qualities);
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
