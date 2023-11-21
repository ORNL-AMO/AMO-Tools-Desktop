/*
  When using ConvertUnitsService you need to chain these commands
  1. Set value you are converting
  2. Declare unit you are converting from
  3. Declare unit you are converting to
  4. converted unit will return
  convertUnitsService.unit(1).from('in').to('ft');
*/



import { Injectable } from '@angular/core';
import { length } from './definitions/length';
import { area } from './definitions/area';
import { mass } from './definitions/mass';
import { volume } from './definitions/volume';
import { _each } from './definitions/each';
import { temperature } from './definitions/temperature';
import { time } from './definitions/time';
import { digital } from './definitions/digital';
import { partsPer } from './definitions/partsPer';
import { pressure } from './definitions/pressure';
import { speed } from './definitions/speed';
import { power } from './definitions/power';
import { current } from './definitions/current';
import { cost } from './definitions/cost';
import { energy } from './definitions/energy';
import { voltage } from './definitions/voltage';
import { apparentPower } from './definitions/apparentPower';
import { reactiveEnergy } from './definitions/reactiveEnergy';
import { reactivePower } from './definitions/reactivePower';
import { volumeFlowRate } from './definitions/volumeFlowRate';
import { viscosity } from './definitions/viscosity';
import { frequency } from './definitions/frequency';
import { force } from './definitions/force';
//import {kineViscosity} from './definitions/kineViscosity'
import { specificHeat } from './definitions/specificHeat';
import { volumetricHeat } from './definitions/volumetricHeat';
import { specificEnergy } from './definitions/specificEnergy';
import { density } from './definitions/density';
import { volumetricEnergy } from './definitions/volumetricEnergy';
import { specificVolume } from './definitions/specificVolume';
import { thermalConductivity } from './definitions/thermalConductivity';
import { powerPerVolume } from './definitions/powerPerVolume';
import { massPerPower } from './definitions/massPerPower';
import { massFlux } from './definitions/massFlux';
import { volumeFlux } from './definitions/volumeFlux';
import { hourlyHeatCapacity } from './definitions/hourlyHeatCapacity';
import { torque } from './definitions/torque';

import * as _ from 'lodash';
import * as each from 'lodash.foreach';
import { Settings } from '../models/settings';
@Injectable()
export class ConvertUnitsService {
  _measures = {
    length: length,
    area: area,
    mass: mass,
    massFlux: massFlux,
    volume: volume,
    each: _.each,
    temperature: temperature,
    time: time,
    digital: digital,
    partsPer: partsPer,
    speed: speed,
    pressure: pressure,
    power: power,
    current: current,
    cost: cost,
    energy: energy,
    voltage: voltage,
    torque: torque,
    apparentPower: apparentPower,
    reactiveEnergy: reactiveEnergy,
    reactivePower: reactivePower,
    volumeFlowRate: volumeFlowRate,
    viscosity: viscosity,
    frequency: frequency,
    force: force,
    //kineViscosity: kineViscosity,
    specificHeat: specificHeat,
    hourlyHeatCapacity: hourlyHeatCapacity,
    volumetricHeat: volumetricHeat,
    volumeFlux: volumeFlux,
    specificEnergy: specificEnergy,
    density: density,
    volumetricEnergy: volumetricEnergy,
    specificVolume: specificVolume,
    thermalConductivity: thermalConductivity,
    massPerPower: massPerPower,
    powerPerVolume: powerPerVolume
  };
  origin: any;
  destination: any;
  val: any;

  constructor() { }

  value(val: any) {
    this.origin = null;
    this.destination = null;
    this.val = val;
    return this;
  }

  describe(resp) {
    return {
      abbr: resp.abbr
      , measure: resp.measure
      , system: resp.system
      , singular: resp.unit.name.singular
      , plural: resp.unit.name.plural
    };
  }

  from(from: any) {
    if (!this.val) {
      if (this.val !== 0) {
        // throw new Error('need to set value before call to .from');
        //console.log('You need to set a value (make sure its not undefined) before you call .from');
      }
    }
    if (this.destination)
      throw new Error('.from must be called before .to');
    this.origin = this.getUnit(from);
    if (!this.origin) {
      this.throwUnsupportedUnitError(from);
    }
    return this;
  }

  to(to: any) {
    if (!this.origin)
      throw new Error('.to must be called after .from');

    this.destination = this.getUnit(to);

    var result
      , transform;

    if (!this.destination) {
      this.throwUnsupportedUnitError(to);
    }

    // Don't change the value if origin and destination are the same
    if (this.origin.abbr === this.destination.abbr) {
      return this.val;
    }

    // You can't go from liquid to mass, for example
    if (this.destination.measure !== this.origin.measure) {
      throw new Error('Cannot convert incompatible measures of '
        + this.destination.measure + ' and ' + this.origin.measure);
    }

    /**
     * Convert from the source value to its anchor inside the system
     */
    result = this.val * this.origin.unit.to_anchor;

    /**
     * For some changes it's a simple shift (C to K)
     * So we'll add it when converting into the unit (later)
     * and subtract it when converting from the unit
     */
    if (this.origin.unit.anchor_shift) {
      result -= this.origin.unit.anchor_shift;
    }

    /**
     * Convert from one system to another through the anchor ratio. Some conversions
     * aren't ratio based or require more than a simple shift. We can provide a custom
     * transform here to provide the direct result
     */
    if (this.origin.system !== this.destination.system) {
      transform = this._measures[this.origin.measure]._anchors[this.origin.system].transform;
      if (typeof transform === 'function') {
        result = transform(result);
      }
      else {
        result *= this._measures[this.origin.measure]._anchors[this.origin.system].ratio;
      }
    }

    /**
     * This shift has to be done after the system conversion business
     */
    if (this.destination.unit.anchor_shift) {
      result += this.destination.unit.anchor_shift;
    }

    /**
     * Convert to another unit inside the destination system
     */
    return result / this.destination.unit.to_anchor;
  }

  getUnit(abbr: string) {
    var found;

    _.each(this._measures, function (systems, measure) {
      _.each(systems, function (units, system) {
        if (system === '_anchors')
          return false;

        _.each(units, function (unit, testAbbr: string) {
          if (testAbbr === abbr) {
            found = {
              abbr: abbr
              , measure: measure
              , system: system
              , unit: unit
            };
            return false;
          }
        });

        if (found)
          return false;
      });

      if (found)
        return false;
    });

    return found;
  }

  throwUnsupportedUnitError(what: any) {
    var validUnits = [];
    _.each(this._measures, function (systems, measure) {
      _.each(systems, function (units, system) {
        if (system === '_anchors')
          return false;

        validUnits = validUnits.concat(_.keys(units));
      });
    });

    throw new Error('Unsupported unit ' + what + ', use one of: ' + validUnits.join(', '));
  }

  possibilities(measure) {
    var possibilities = [];
    if (!this.origin && !measure) {
      _.each(_.keys(this._measures), function (measure) {
        _.each(this._measures[measure], function (units, system) {
          if (system === '_anchors')
            return false;

          possibilities = possibilities.concat(_.keys(units));
        });
      });
    } else {
      measure = measure || this.origin.measure;
      _.each(this._measures[measure], function (units, system) {
        if (system === '_anchors')
          return false;

        possibilities = possibilities.concat(_.keys(units));
      });
    }

    return possibilities;
  }

  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits));
  }

  measures() {
    return _.keys(this._measures);
  }

  
  convertFt3AndM3Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft3', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3', 'ft3');
    }
  }

  convertMMBtuAndGJValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'MMBtu', 'GJ');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'GJ', 'MMBtu');
    }
  }

  convertPowerValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'hp', 'kW');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kW', 'hp');
    }
  }

  convertTemperatureValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'F', 'C');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'C', 'F');
    }
  }

  convertFt2AndCm2Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft2', 'cm2');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'cm2', 'ft2');
    }
  }

  convertFt3AndLiterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft3', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L', 'ft3');
    }
  }

  convertFtAndMeterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'ft', 'm');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm', 'ft');
    }
  }

  convertGallonPerMinuteAndLiterPerSecondValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gpm', 'L/s');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L/s', 'gpm');
    }
  }

  convertGallonPerMinuteAndM3PerSecondValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gpm', 'm3/s');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3/s', 'gpm');
    }
  }

  convertInAndCmValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'in', 'cm');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'cm', 'in');
    }
  }

  convertPsigAndBargValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'psig', 'barg');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'barg', 'psig');
    }
  }

  convertGalAndLiterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gal', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L', 'gal');
    }
  }

  convertGalAndM3Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'gal', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3', 'gal');
    }
  }

  convertLbAndKgValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'lb', 'kg');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kg', 'lb');
    }
  }

  convertKGalAndLiterValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'kgal', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'L', 'kgal');
    }
  }

  convertKscfAndM3Value(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'kscf', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'm3', 'kscf');
    }
  }

  convertKlbAndTonneValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'klb', 'tonne');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'tonne', 'klb');
    }
  }

  convertDollarsPerMMBtuAndGJ(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'MMBtu', 'GJ');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'GJ', 'MMBtu');
    }
  }

  convertDollarsPerGalAndLiter(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'gal', 'L');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'L', 'gal');
    }
  }

  convertDollarsPerFt3AndM3(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'ft3', 'm3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'm3', 'ft3');
    }
  }

  convertDollarsPerKlbAndTonne(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertDollarPerValue(val, 'klb', 'tonne');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertDollarPerValue(val, 'tonne', 'klb');
    }
  }

  convertConductivity(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'Btu/hr-ft-R', 'W/mK');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'W/mK', 'Btu/hr-ft-R');
    }
  }

  convertPsiaAndKpaa(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'psia', 'kPaa');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kPaa', 'psia');
    }
  }

  convertPsigAndKpag(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'psig', 'kPag');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kPag', 'psig');
    }
  }
  convertInAndMm(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'in', 'mm');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'mm', 'in');
    }
  }

  convertMphAndKmPerHour(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'mph', 'km/h');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'km/h', 'mph');
    }
  }

  convertTonsAndKW(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      return this.convertValue(val, 'tons', 'kW');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      return this.convertValue(val, 'kW', 'tons');
    }
  }


  convertValue(value: number, oldUnit: string, newUnit: string): number {
    value = this.value(value).from(oldUnit).to(newUnit);
    return value;
  }

  convertDollarPerValue(value: number, oldUnit: string, newUnit: string): number {
    let conversionHelper: number = this.value(1).from(oldUnit).to(newUnit);
    return value / conversionHelper;
  }

  convertArray(oldArray: Array<number>, from: string, to: string): Array<number> {
    let convertedArray = new Array<number>();
    for (let i = 0; i < oldArray.length; i++) {
      convertedArray.push(this.convertValue(oldArray[i], from, to));
    }
    return convertedArray;
  }

  convertInvertedEnergy(outputRate: number, oldUnit: string, newUnit: string) {  
    // For fuel emissions factor and other mass/energy
    let conversionHelper: number = this.value(1).from(oldUnit).to(newUnit);
    outputRate = outputRate / conversionHelper;
    return outputRate;
  }

  convertSettingsUnitCosts(oldSettings: Settings, newSettings: Settings): Settings {
    //imperial: $/MMBtu, metric: $/GJ
    newSettings.fuelCost = this.convertDollarsPerMMBtuAndGJ(newSettings.fuelCost, oldSettings, newSettings);
    //imperial: $/klb, metric: $/tonne
    newSettings.steamCost = this.convertDollarsPerKlbAndTonne(newSettings.steamCost, oldSettings, newSettings);
    //imperial: $/gal, metric: $/L
    newSettings.waterCost = this.convertDollarsPerGalAndLiter(newSettings.waterCost, oldSettings, newSettings);
    //imperial: $/MMBtu, metric: $/GJ
    newSettings.otherFuelCost = this.convertDollarsPerMMBtuAndGJ(newSettings.otherFuelCost, oldSettings, newSettings);
    //imperial: $/gal, metric: $/L
    newSettings.waterWasteCost = this.convertDollarsPerGalAndLiter(newSettings.waterWasteCost, oldSettings, newSettings);
    //imperial: $/scf, metric: $/m2
    newSettings.compressedAirCost = this.convertDollarsPerFt3AndM3(newSettings.compressedAirCost, oldSettings, newSettings);
    return newSettings;
  }

  convertTemperatures(XYValues: Array<number>, settings: Settings) {
    if (settings.fanTemperatureMeasurement === 'C' || settings.fanTemperatureMeasurement === 'K') {
      XYValues = this.convertArray(XYValues, 'F', 'C');
    }
    return XYValues;
  }
}
