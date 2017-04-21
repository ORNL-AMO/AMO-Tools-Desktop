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
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.getAllUnits();
  }

  getAllUnits() {
    let possibilites = this.convertUnitsService.possibilities('mass');
    console.log(possibilites);
    //let list = this.convertUnitsService.list('mass');
    //console.log(list);
  }

  getMeasures() {
    console.log(this.measure)
    if(this.measure){
      this.possibilities = this.convertUnitsService.possibilities(this.measure); 
    }
  }
}
