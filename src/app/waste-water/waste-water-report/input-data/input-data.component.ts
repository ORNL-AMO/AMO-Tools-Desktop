import { Component, Input, OnInit } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WasteWater } from '../../../shared/models/waste-water';

@Component({
  selector: 'app-input-data',
  templateUrl: './input-data.component.html',
  styleUrls: ['./input-data.component.css']
})
export class InputDataComponent implements OnInit {
  @Input()
  wasteWater: WasteWater;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
