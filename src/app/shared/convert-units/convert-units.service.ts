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


import * as _ from 'lodash';
import * as keys from 'lodash.keys';
import * as each from 'lodash.foreach';
import { massPerPower } from './definitions/massPerPower';
import { massFlux } from './definitions/massFlux';
import { volumeFlux } from './definitions/volumeFlux';
@Injectable()
export class ConvertUnitsService {
  _measures = {
    length: length,
    area: area,
    mass: mass,
    massFlux: massFlux,
    volume: volume,
    each: each,
    temperature: temperature,
    time: time,
    digital: digital,
    partsPer: partsPer,
    speed: speed,
    pressure: pressure,
    power: power,
    current: current,
    energy: energy,
    voltage: voltage,
    apparentPower: apparentPower,
    reactiveEnergy: reactiveEnergy,
    reactivePower: reactivePower,
    volumeFlowRate: volumeFlowRate,
    viscosity: viscosity,
    frequency: frequency,
    force: force,
    //kineViscosity: kineViscosity,
    specificHeat: specificHeat,
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

    each(this._measures, function (systems, measure) {
      each(systems, function (units, system) {
        if (system === '_anchors')
          return false;

        each(units, function (unit, testAbbr) {
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
    each(this._measures, function (systems, measure) {
      each(systems, function (units, system) {
        if (system === '_anchors')
          return false;

        validUnits = validUnits.concat(keys(units));
      });
    });

    throw new Error('Unsupported unit ' + what + ', use one of: ' + validUnits.join(', '));
  }

  possibilities(measure) {
    var possibilities = [];
    if (!this.origin && !measure) {
      each(keys(this._measures), function (measure) {
        each(this._measures[measure], function (units, system) {
          if (system === '_anchors')
            return false;

          possibilities = possibilities.concat(keys(units));
        });
      });
    } else {
      measure = measure || this.origin.measure;
      each(this._measures[measure], function (units, system) {
        if (system === '_anchors')
          return false;

        possibilities = possibilities.concat(keys(units));
      });
    }

    return possibilities;
  }

  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits));
  }

  // list(measure?) {
  //   var list = [];

  //   each(this._measures, function (systems, testMeasure) {
  //     if (measure && measure !== testMeasure)
  //       return;

  //     each(systems, function (units, system) {
  //       if (system == '_anchors')
  //         return false;

  //       each(units, function (unit, abbr) {
  //         list = list.concat(this.describe({
  //           abbr: abbr,
  //           measure: testMeasure
  //           , system: system
  //           , unit: unit
  //         }));
  //       });
  //     });
  //   });

  //   return list;
  // }

  measures() {
    return keys(this._measures);
  }
}
