import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AirLeakService } from '../air-leak.service';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-air-leak-results-table',
    templateUrl: './air-leak-results-table.component.html',
    styleUrls: ['./air-leak-results-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AirLeakResultsTableComponent implements OnInit {

  airLeakOutput: AirLeakSurveyOutput;
  allSelected: boolean = true;

  @Input()
  settings: Settings;

  private destroyRef = inject(DestroyRef);

  constructor(private airLeakService: AirLeakService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.airLeakService.airLeakOutput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.airLeakOutput = value;
        this.updateAllSelected();
        this.cdr.markForCheck();
      });
    this.airLeakService.resetData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value) {
          this.allSelected = true;
          this.cdr.markForCheck();
        }
      });
  }

  editLeak(index: number) {
    this.airLeakService.currentLeakIndex.next(index);
  }

  copyLeak(index: number) {
    this.airLeakService.copyLeak(index);
  }

  deleteLeak(index: number) {
    this.airLeakService.deleteLeak(index);
  }

  toggleSelected(index: number, event: Event) {
    const selected = (event.target as HTMLInputElement).checked;
    this.airLeakService.setLeakForModification(index, selected);
    this.updateAllSelected();
  }

  toggleSelectAll(){
    const newValue = !this.allSelected;
    this.airLeakService.setLeakForModificationSelectAll(newValue);
    this.allSelected = newValue;
  }

  private updateAllSelected() {
    if (this.airLeakOutput && this.airLeakOutput.individualLeaks && this.airLeakOutput.individualLeaks.length > 0) {
      this.allSelected = this.airLeakOutput.individualLeaks.every(leak => leak.selected);
    } else {
      this.allSelected = true;
    }
  }

}
