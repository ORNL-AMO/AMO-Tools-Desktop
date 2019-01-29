import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-hover-table',
  templateUrl: './hover-table.component.html',
  styleUrls: ['./hover-table.component.css']
})
export class HoverTableComponent implements OnInit {
  @Input()
  hoveredEquipment: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;

  constructor() { }

  ngOnInit() {
  }

}
