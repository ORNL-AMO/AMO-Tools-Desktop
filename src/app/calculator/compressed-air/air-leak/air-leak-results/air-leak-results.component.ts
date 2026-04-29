import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { AirLeakService } from '../air-leak.service';

@Component({
    selector: 'app-air-leak-results',
    templateUrl: './air-leak-results.component.html',
    styleUrls: ['./air-leak-results.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AirLeakSurveyResultsComponent implements OnInit {

  airLeakOutput: AirLeakSurveyOutput;

  @Input()
  settings: Settings;
  modificationExists: boolean = false;

  @ViewChild('baselineTable', { static: false }) baselineTable: ElementRef;
  baselineTableString: string;
  @ViewChild('modTable', { static: false }) modTable: ElementRef;
  modTableString: string;
  @ViewChild('savingsTable', { static: false }) savingsTable: ElementRef;
  savingsTableString: string;
  allTablesString: string;
  compressorControlAdjustment: number;

  private destroyRef = inject(DestroyRef);

  constructor(private airLeakService: AirLeakService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.airLeakService.airLeakOutput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.airLeakOutput = value;
        this.cdr.markForCheck();
      });
    this.airLeakService.airLeakInput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value && value.facilityCompressorData.utilityType === 1) {
          this.compressorControlAdjustment = value.facilityCompressorData.compressorElectricityData.compressorControlAdjustment;
        } else {
          this.compressorControlAdjustment = undefined;
        }
        this.cdr.markForCheck();
      });
  }

  updateTableString() {
    // altered 7419
    // this.allTablesString = 
    // this.baselineTable.nativeElement.innerText + '\n' +
    // this.modTable.nativeElement.innerText + '\n' +
    // this.savingsTable.nativeElement.innerText;
    this.allTablesString = this.savingsTable.nativeElement.innerText;
  }

}
