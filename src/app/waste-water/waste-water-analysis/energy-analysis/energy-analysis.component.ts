import { Component, Input, OnInit } from '@angular/core';

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
  
  constructor() { }

  ngOnInit(): void {
  }

}
