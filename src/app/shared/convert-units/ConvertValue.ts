
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

export class ConvertValue {
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
    convertedValue: number;
    hasError: boolean;

    /**
     * Creates an instance of ConvertValue to convert a numeric value from one unit to another.
     * 
     * @param {number} value - The numeric value to be converted
     * @param {string} from - The source unit abbreviation (e.g., 'ft', 'm', 'kg', 'lb')
     * @param {string} to - The destination unit abbreviation (e.g., 'ft', 'm', 'kg', 'lb')
     * 
     * @example
     * // Convert 10 feet to meters
     * const converter = new ConvertValue(10, 'ft', 'm');
     * console.log(converter.convertedValue); // Output: converted value in meters
     * 
     * @example
     * // Convert 100 pounds to kilograms
     * const converter = new ConvertValue(100, 'lb', 'kg');
     * console.log(converter.convertedValue); // Output: converted value in kilograms
     */
    constructor(value: number, from: string, to: string) {
        if (value != undefined) {
            this.origin = this.getUnit(from);
            this.destination = this.getUnit(to);

            if (!this.origin || !this.destination) {
                this.hasError = true;
                this.convertedValue = value;
            } else {
                this.hasError = false;
                this.convertedValue = this.convertValue(value);
            }
        }
    }

    convertValue(value: number) {
        // Don't change the value if origin and destination are the same
        if (this.origin.abbr === this.destination.abbr) {
            return value;
        }

        // You can't go from liquid to mass, for example
        if (this.destination.measure !== this.origin.measure) {
            this.hasError = true;
            return value;
        }

        /**
         * Convert from the source value to its anchor inside the system
         */
        let result: number = value * this.origin.unit.to_anchor;

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
            let transform = this._measures[this.origin.measure]._anchors[this.origin.system].transform;
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
        this.hasError = false;
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
        // console.log(found);

        return found;
    }
}