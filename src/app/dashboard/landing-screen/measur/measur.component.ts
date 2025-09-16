import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-measur',
    templateUrl: './measur.component.html',
    styleUrls: ['./measur.component.css'],
    standalone: false
})
export class MeasurComponent implements OnInit {

  textShow: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  showText() {
    this.textShow = true;
    window.dispatchEvent(new Event("resize"));
  }

  hideText() {
    this.textShow = false;
    window.dispatchEvent(new Event("resize"));
  }
}
