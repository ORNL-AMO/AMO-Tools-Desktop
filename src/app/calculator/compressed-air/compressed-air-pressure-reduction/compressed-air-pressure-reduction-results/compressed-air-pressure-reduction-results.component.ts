import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirPressureReductionResults } from '../../../../shared/models/standalone';

@Component({
    selector: 'app-compressed-air-pressure-reduction-results',
    templateUrl: './compressed-air-pressure-reduction-results.component.html',
    styleUrls: ['./compressed-air-pressure-reduction-results.component.css'],
    standalone: false
})
export class CompressedAirPressureReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  compressedAirPressureReductionResults: CompressedAirPressureReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;


  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.updateTableString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.compressedAirPressureReductionResults && changes.compressedAirPressureReductionResults.firstChange == false) {
      this.updateTableString();
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
