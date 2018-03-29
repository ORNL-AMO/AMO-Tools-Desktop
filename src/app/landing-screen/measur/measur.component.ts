import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-measur',
  templateUrl: './measur.component.html',
  styleUrls: ['./measur.component.css']
})
export class MeasurComponent implements OnInit {

  textShow: boolean = true;
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.textShow = false;
    }, 300)
  }

  showText(){
    this.textShow = true;
  }

  hideText(){
    this.textShow = false;
  }
}
