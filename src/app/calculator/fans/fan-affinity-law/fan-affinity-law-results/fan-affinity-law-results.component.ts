import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FanAffinityLawsOutput, FanAffinityLawsScenario } from '../../../../shared/models/standalone';

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

  // Which scenarios each intermediate/output field applies to, e.g. Desired Flow is the modification
  // target for VSD/Two-Speed control (with or without a fan size change) but not a fan-size-only change.
  private static readonly FIELD_SCENARIOS: { [field: string]: FanAffinityLawsScenario[] } = {
    desiredFlow: ['vsd', 'twoSpeed', 'vsdChangeFanSize', 'twoSpeedChangeFanSize'],
    timeFactors: ['twoSpeed', 'twoSpeedChangeFanSize'],
    fanDiameterRatio: ['changeFanSize', 'vsdChangeFanSize', 'twoSpeedChangeFanSize'],
    newFanRatedFlow: ['vsdChangeFanSize', 'twoSpeedChangeFanSize'],
    newFlowPercent: ['changeFanSize', 'vsdChangeFanSize', 'twoSpeedChangeFanSize'],
  };

  showField(field: string): boolean {
    return this.modificationExists
      && FanAffinityLawResultsComponent.FIELD_SCENARIOS[field].includes(this.fanAffinityLawResults?.scenario);
  }

  // Time Above/At 0/At 50 Percent apply to whichever side (Current or New) actually runs Two-Speed
  // control, so the row can be relevant for the baseline even when the modification isn't Two-Speed.
  showTimeFactors(): boolean {
    return this.fanAffinityLawResults?.baselineTimeAbove50Percent !== undefined || this.showField('timeFactors');
  }

}
