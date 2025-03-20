import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { PipeInsulationReductionResults } from '../../../../shared/models/standalone';

@Component({
    selector: 'app-pipe-insulation-reduction-results',
    templateUrl: './pipe-insulation-reduction-results.component.html',
    styleUrls: ['./pipe-insulation-reduction-results.component.css'],
    standalone: false
})
export class PipeInsulationReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: PipeInsulationReductionResults;
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
