import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FanAffinityLawsOutput } from '../../../../shared/models/standalone';

@Component({
    selector: 'app-fan-affinity-law-results',
    templateUrl: './fan-affinity-law-results.component.html',
    styleUrls: ['./fan-affinity-law-results.component.css'],
    standalone: false
})
export class FanAffinityLawResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fanAffinityLawResults: FanAffinityLawsOutput;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.updateTableString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fanAffinityLawResults && changes.fanAffinityLawResults.firstChange == false) {
      this.updateTableString();
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
