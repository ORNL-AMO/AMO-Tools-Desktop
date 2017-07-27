import { Component, OnInit, Input } from '@angular/core';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
@Component({
  selector: 'app-designed-energy-results',
  templateUrl: './designed-energy-results.component.html',
  styleUrls: ['./designed-energy-results.component.css']
})
export class DesignedEnergyResultsComponent implements OnInit {
  @Input()
  results: DesignedEnergyResults;
  constructor() { }

  ngOnInit() {
  }

}
