import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';

@Component({
  selector: 'app-metered-energy-results',
  templateUrl: './metered-energy-results.component.html',
  styleUrls: ['./metered-energy-results.component.css']
})
export class MeteredEnergyResultsComponent implements OnInit {
  @Input()
  results: MeteredEnergyResults;
  constructor() { }

  ngOnInit() {
  }

}
