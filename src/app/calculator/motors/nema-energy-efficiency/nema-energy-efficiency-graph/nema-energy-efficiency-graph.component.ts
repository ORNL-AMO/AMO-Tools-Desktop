import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-nema-energy-efficiency-graph',
    templateUrl: './nema-energy-efficiency-graph.component.html',
    styleUrls: ['./nema-energy-efficiency-graph.component.css'],
    standalone: false
})
export class NemaEnergyEfficiencyGraphComponent implements OnInit {
  @Input()
  tefcValue: number;

  constructor() { }

  ngOnInit() {
  }

 
}
