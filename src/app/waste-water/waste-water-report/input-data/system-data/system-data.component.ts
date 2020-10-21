import { Component, Input, OnInit } from '@angular/core';
import { WasteWater } from '../../../../shared/models/waste-water';

@Component({
  selector: 'app-system-data',
  templateUrl: './system-data.component.html',
  styleUrls: ['./system-data.component.css']
})
export class SystemDataComponent implements OnInit {
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
