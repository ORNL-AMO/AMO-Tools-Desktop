import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AirLeakService } from '../air-leak.service';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-air-leak-copy-table',
    templateUrl: './air-leak-copy-table.component.html',
    styleUrls: ['./air-leak-copy-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AirLeakCopyTableComponent implements OnInit {

  @ViewChild('leaksTable', { static: false }) leaksTable: ElementRef;
  @Input()
  settings: Settings;

  airLeakOutput: AirLeakSurveyOutput;

  leaksTableString: any;

  private destroyRef = inject(DestroyRef);

  constructor(private airLeakService: AirLeakService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.airLeakService.airLeakOutput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.airLeakOutput = value;
        this.cdr.markForCheck();
      });
  }
  updateLeaksTableString() {
    this.leaksTableString = this.leaksTable.nativeElement.innerText;
  }

}
