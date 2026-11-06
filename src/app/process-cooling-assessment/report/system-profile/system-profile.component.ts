import { Component, computed, signal, effect, ElementRef, ViewChild, inject, WritableSignal, DestroyRef, Signal } from '@angular/core';
import { ProcessCoolingResultsService } from '../../services/process-cooling-results.service';
import { LOAD_LABELS } from '../../constants/process-cooling-constants';
import { ProfileView, SystemProfileService, SystemProfileUI } from '../../services/system-profile.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getProcessCoolingUnitLabel } from '../../constants/process-cooling-units';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-system-profile',
  standalone: false,
  templateUrl: './system-profile.component.html',
  styleUrls: ['./system-profile.component.css']
})
export class SystemProfileComponent {
  private systemProfileService = inject(SystemProfileService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  copyTableString: string;
  
  LOAD_LABELS = LOAD_LABELS;

  private readonly settingsSignal = this.processCoolingAssessmentService.settingsSignal;
  readonly efficiencyLabel: Signal<string> = computed(() => getProcessCoolingUnitLabel('efficiency', this.settingsSignal()?.unitsOfMeasure));
  readonly chillerPowerLabel: Signal<string> = computed(() => getProcessCoolingUnitLabel('chillerPower', this.settingsSignal()?.unitsOfMeasure));
  readonly energyLabel: Signal<string> = computed(() => getProcessCoolingUnitLabel('energy', this.settingsSignal()?.unitsOfMeasure));

  selectedResultsId = signal<string>(undefined);
  systemProfileUI$: Observable<SystemProfileUI>;
  resultsViewSignal: WritableSignal<ProfileView> = this.processCoolingUiService.profileViewSignal;

  constructor(public processCoolingResultsService: ProcessCoolingResultsService) {
    effect(() => {
      const view = this.resultsViewSignal();
      if (view === 'report') {
        this.systemProfileUI$ = this.systemProfileService.reportProfileUI$;
      } else if (view === 'baseline') {
        this.systemProfileUI$ = this.systemProfileService.baselineProfileUI$;
      }

      this.systemProfileUI$.pipe(
        take(1),
        tap(systemProfileUI => {
          this.selectedResultsId.set(systemProfileUI.systemProfileChillerOutput[0]?.id || undefined);
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    });
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
