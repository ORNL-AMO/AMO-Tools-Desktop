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
  measure: any;
  from: string;
  to: string;
  value: number;
  results: number;
  fromDisp: string;
  toDisp: string;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
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
          display: this.getUnitName(unit)
        }
        this.possibilities.push(tmpPossibility);
      })
      console.log(this.possibilities);
    }
  }

  getValue() {
    if (this.from && this.to && this.value) {
      return this.convertUnitsService.value(this.value).from(this.from).to(this.to);
    } else {
      return 0;
    }
  }

  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }
}
