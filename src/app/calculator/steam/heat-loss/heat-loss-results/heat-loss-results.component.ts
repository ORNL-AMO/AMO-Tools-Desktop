import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { HeatLossOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-heat-loss-results',
    templateUrl: './heat-loss-results.component.html',
    styleUrls: ['./heat-loss-results.component.css'],
    standalone: false
})
export class HeatLossResultsComponent implements OnInit {
  @Input()
  results: HeatLossOutput;
  @Input()
  settings: Settings;
  @Input()
  percentHeatLoss: number;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

}
