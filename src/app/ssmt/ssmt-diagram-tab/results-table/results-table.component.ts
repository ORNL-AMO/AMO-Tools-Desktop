import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';

@Component({
    selector: 'app-results-table',
    templateUrl: './results-table.component.html',
    styleUrls: ['./results-table.component.css'],
    standalone: false
})
export class ResultsTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;
  @Input()
  selectedTable: string;
  @Output('emitCalculateResultsWithMarginalCosts')
  emitCalculateResultsWithMarginalCosts = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }

  calculateResultsWithMarginalCosts(){
    this.emitCalculateResultsWithMarginalCosts.emit(true);
  }
}
