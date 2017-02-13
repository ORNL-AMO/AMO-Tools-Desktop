import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {

  constructor(private _location: Location) { }

  ngOnInit() {
  }

  goBack(){
    this._location.back();
  }
}
