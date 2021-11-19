import { Component, Input, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-energy-analysis',
  templateUrl: './energy-analysis.component.html',
  styleUrls: ['./energy-analysis.component.css']
})
export class EnergyAnalysisComponent implements OnInit {
  @Input()
  containerHeight: number;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
  }

}
