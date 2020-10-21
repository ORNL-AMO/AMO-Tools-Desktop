import { Component, Input, OnInit } from '@angular/core';
import { WasteWater } from '../../../../shared/models/waste-water';

@Component({
  selector: 'app-activated-sludge-data',
  templateUrl: './activated-sludge-data.component.html',
  styleUrls: ['./activated-sludge-data.component.css']
})
export class ActivatedSludgeDataComponent implements OnInit {
  @Input()
  wasteWater: WasteWater;
  @Input()
  printView: boolean;


  collapse: boolean;
  constructor() { }

  ngOnInit(): void {
  }

  toggleCollapse(){
    this.collapse = !this.collapse;
  }
}
