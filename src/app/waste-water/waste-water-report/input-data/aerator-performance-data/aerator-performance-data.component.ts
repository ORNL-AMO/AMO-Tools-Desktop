import { Component, Input, OnInit } from '@angular/core';
import { WasteWater } from '../../../../shared/models/waste-water';

@Component({
  selector: 'app-aerator-performance-data',
  templateUrl: './aerator-performance-data.component.html',
  styleUrls: ['./aerator-performance-data.component.css']
})
export class AeratorPerformanceDataComponent implements OnInit {
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
