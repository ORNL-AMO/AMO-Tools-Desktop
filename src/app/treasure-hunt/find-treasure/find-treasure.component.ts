import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-find-treasure',
  templateUrl: './find-treasure.component.html',
  styleUrls: ['./find-treasure.component.css']
})
export class FindTreasureComponent implements OnInit {

  selectedCalc: string = 'none';
  constructor() { }

  ngOnInit() {
  }


  selectCalc(str: string){
    this.selectedCalc = str;
  }

}
