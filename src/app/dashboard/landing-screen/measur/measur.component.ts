import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';


@Component({
  selector: 'app-measur',
  templateUrl: './measur.component.html',
  styleUrls: ['./measur.component.css']
})
export class MeasurComponent implements OnInit {

  textShow: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  showText() {
    this.textShow = true;
  }

  hideText() {
    this.textShow = false;
  }
}
