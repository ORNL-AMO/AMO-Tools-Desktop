import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { TankInsulationReductionResults } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-tank-insulation-reduction-results',
  templateUrl: './tank-insulation-reduction-results.component.html',
  styleUrls: ['./tank-insulation-reduction-results.component.css']
})
export class TankInsulationReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: TankInsulationReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
}
