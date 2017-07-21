import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {
  @Input()
  pumpSavingsPotential: number;
  @Input()
  numPsats: number;
  @Input()
  energySavingsPotential: number;
  @Input()
  totalCost: number;
  @Input()
  totalEnergy: number;
  constructor() { }

  ngOnInit() {
  }

}
