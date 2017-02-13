import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {

  constructor(private _location: Location) { }

  ngOnInit() {
  }

  goBack(){
  this._location.back();
}

}
