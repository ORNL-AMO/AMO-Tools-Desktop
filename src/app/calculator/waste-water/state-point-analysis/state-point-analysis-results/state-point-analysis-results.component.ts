import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { StatePointAnalysisOutput } from '../../../../shared/models/waste-water';
import { StatePointAnalysisService } from '../state-point-analysis.service';

@Component({
  selector: 'app-state-point-analysis-results',
  templateUrl: './state-point-analysis-results.component.html',
  styleUrls: ['./state-point-analysis-results.component.css']
})
export class StatePointAnalysisResultsComponent implements OnInit {


  @Input()
  settings: Settings;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;


  outputSubscription: Subscription;
  output: StatePointAnalysisOutput;

  constructor(private statePointAnalysisService: StatePointAnalysisService) { }

  ngOnInit(): void {
    this.outputSubscription = this.statePointAnalysisService.output.subscribe(val => {
      this.output = val;
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
