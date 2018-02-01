import { Component, OnInit } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { length } from '../../../shared/convert-units/definitions/length';

@Component({
  selector: 'app-unit-converter',
  templateUrl: './unit-converter.component.html',
  styleUrls: ['./unit-converter.component.css']
})
export class UnitConverterComponent implements OnInit {
  possibilities: Array<any> = [];
  measure: any = 'apparentPower';
  from: string;
  to: string;
  value1: number;
  value2: number;
  results: number;
  fromDisp: string;
  toDisp: string;

  options = [
    {
      measure: 'length',
      display: 'Length'
    },
    {
      measure: 'area',
      display: 'Area'
    },
    {
      measure: 'volume',
      display: 'Volume'
    },
    {
      measure: 'temperature',
      display: 'Temperature'
    },
    {
      measure: 'time',
      display: 'Time'
    },
    {
      measure: 'digital',
      display: 'Digital'
    },
    {
      measure: 'partsPer',
      display: 'Parts Per'
    },
    {
      measure: 'speed',
      display: 'Speed'
    },
    {
      measure: 'power',
      display: 'Power'
    },
    {
      measure: 'current',
      display: 'Current'
    },
    {
      measure: 'energy',
      display: 'Energy'
    },
    {
      measure: 'voltage',
      display: 'Voltage'
    },
    {
      measure: 'apparentPower',
      display: 'Apparent Power'
    },
    {
      measure: 'reactiveEnergy',
      display: 'Reactive Energy'
    },
    {
      measure: 'reactivePower',
      display: 'Reactive Power'
    },
    {
      measure: 'volumeFlowRate',
      display: 'Volumetric Flow Rate'
    },
    {
      measure: 'volumetricHeat',
      display: 'Volumetric Specific Heat'
    },
    {
      measure: 'viscosity',
      display: 'Viscosity'
    },
    {
      measure: 'frequency',
      display: 'Frequency'
    },
    {
      measure: 'force',
      display: 'Force'
    },
    {
      measure: 'pressure',
      display: 'Pressure'
    },
    {
      measure: 'mass',
      display: 'Mass'
    },
    // {
    //   measure: 'kineViscosity',
    //   display: 'Kinematic Viscosity'
    // },
    {
      measure: 'specificHeat',
      display: 'Specific Heat'
    },
    {
      measure: 'specificEnergy',
      display: 'Specific Energy'
    },
    {
      measure: 'density',
      display: 'Density'
    },
    {
      measure: 'volumetricEnergy',
      display: 'Volumetric Energy'
    }
  ]

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.getMeasures();
  }


  getMeasures() {
    this.from = null;
    this.to = null;
    if (this.measure) {
      this.possibilities = new Array();
      let tmpList = this.convertUnitsService.possibilities(this.measure);
      tmpList.forEach(unit => {
        let tmpPossibility = {
          unit: unit,
          display: this.getUnitName(unit),
          displayUnit: this.getUnitDisplay(unit)
        }
        this.possibilities.push(tmpPossibility);
      })
      this.from = this.possibilities[0].unit;
      this.to = this.possibilities[1].unit;
      this.value1 = 1;
      this.getValue2();
    }
  }

  getValue1() {
    if (this.from && this.to && (this.value2 || this.value2 == 0)) {
      this.value1 = this.convertUnitsService.value(this.value2).from(this.to).to(this.from);
    } else {
      this.value1 = 0;
    }
  }

  getValue2() {
    if (this.from && this.to && (this.value1 || this.value1 == 0)) {
      this.value2 = this.convertUnitsService.value(this.value1).from(this.from).to(this.to);
    } else {
      this.value2 = 0;
    }
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
