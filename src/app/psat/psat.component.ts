import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { PSAT } from './psat';
import { PsatService} from './psat.service';
@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  psat: PSAT;

  constructor(private _location: Location, private _psatService: PsatService) { }

  ngOnInit() {
    this.psat = this._psatService.getNewPsat();
    this.psat.efficiency = 1;
    let test = JSON.stringify(this.psat);
    console.log(test);
  }

  goBack(){
    this._location.back();
  }

}
