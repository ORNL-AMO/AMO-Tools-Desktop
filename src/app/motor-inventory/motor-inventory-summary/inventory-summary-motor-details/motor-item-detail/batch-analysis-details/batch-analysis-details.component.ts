import { Component, OnInit, Input } from '@angular/core';
import { BatchAnalysisOptions, BatchAnalysisData } from '../../../../motor-inventory';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-batch-analysis-details',
    templateUrl: './batch-analysis-details.component.html',
    styleUrls: ['./batch-analysis-details.component.css'],
    standalone: false
})
export class BatchAnalysisDetailsComponent implements OnInit {
  @Input()
  displayOptions: BatchAnalysisOptions;
  @Input()
  batchAnalysisData: BatchAnalysisData;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit(): void {
  }

}
