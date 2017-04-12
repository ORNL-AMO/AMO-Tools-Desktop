import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-nema-energy-efficiency-graph',
  templateUrl: './nema-energy-efficiency-graph.component.html',
  styleUrls: ['./nema-energy-efficiency-graph.component.css']
})
export class NemaEnergyEfficiencyGraphComponent implements OnInit {
  @Input()
  tefc: number;
  constructor() { }

  ngOnInit() {
  }

}
