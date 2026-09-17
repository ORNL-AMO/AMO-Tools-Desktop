import {
  Component, ChangeDetectionStrategy, OnInit, OnDestroy,
  inject, input, output, effect,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, debounceTime, skip, switchMap, tap } from 'rxjs';
import { SteamLeakSurveyInput } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { SteamLeakSurveyService } from './steam-leak-survey-service';
import { SteamLeakSurveyTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-steam-leak-survey',
  templateUrl: './steam-leak-survey.component.html',
  styleUrls: ['./steam-leak-survey.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SteamLeakSurveyComponent implements OnInit, OnDestroy {
  readonly inTreasureHunt = input<boolean>(false);
  readonly settings = input<Settings | undefined>(undefined);
  readonly operatingHours = input<OperatingHours | undefined>(undefined);
  readonly assessment = input<Assessment | undefined>(undefined);

  readonly emitSave = output<SteamLeakSurveyTreasureHunt>();
  readonly emitCancel = output<boolean>();

  protected readonly surveyService = inject(SteamLeakSurveyService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly calculatorDbService = inject(CalculatorDbService);
  private readonly analyticsService = inject(AnalyticsService);

  activeSettings: Settings;
  tabSelect = 'results';
  smallScreenTab = 'form';

  private assessmentCalculator: Calculator | undefined;

  constructor() {
    effect(() => {
      const assessment = this.assessment();
      if (assessment) {
        this.getCalculatorForAssessment(assessment);
      }
    });

    toObservable(this.surveyService.steamLeakInput).pipe(
      skip(1),
      debounceTime(300),
      switchMap((steamLeakInput) => {
        if (!this.assessmentCalculator) {
          return EMPTY;
        }
        this.assessmentCalculator.steamLeakInput = steamLeakInput;
        return this.calculatorDbService.updateWithObservable(this.assessmentCalculator).pipe(
          switchMap(() => this.calculatorDbService.getAllCalculators()),
          tap((allCalculators) => this.calculatorDbService.setAll(allCalculators)),
        );
      }),
      takeUntilDestroyed(),
    ).subscribe();
  }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-STEAM-leak');
    this.calculatorDbService.isSaving = false;

    this.activeSettings = this.settings() ?? this.settingsDbService.globalSettings;
    this.surveyService.settings = this.activeSettings;

    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (!this.surveyService.steamLeakInput()) {
      this.surveyService.initDefaultEmptyInputs(this.activeSettings);
    } else if (
      this.surveyService.lastUnitsOfMeasure &&
      this.surveyService.lastUnitsOfMeasure !== this.activeSettings.unitsOfMeasure
    ) {
      this.surveyService.convertSurveyInput(this.surveyService.lastUnitsOfMeasure, this.activeSettings);
    }
    this.surveyService.lastUnitsOfMeasure = this.activeSettings.unitsOfMeasure;
  }

  ngOnDestroy(): void {
    this.surveyService.currentLeakIndex.set(0);
  }

  setTab(tab: string): void {
    this.tabSelect = tab;
  }

  setSmallScreenTab(tab: string): void {
    this.smallScreenTab = tab;
  }

  btnResetData(): void {
    this.surveyService.resetToEmpty(this.activeSettings);
  }

  btnGenerateExample(): void {
    this.surveyService.generateExampleData(this.activeSettings);
  }

  save(): void {
    const surveyInput = this.surveyService.steamLeakInput();
    if (surveyInput) {
      this.emitSave.emit({ steamLeakSurveyInput: surveyInput, opportunityType: Treasure.steamLeak });
    }
  }

  cancel(): void {
    this.emitCancel.emit(true);
  }

  private async getCalculatorForAssessment(assessment: Assessment): Promise<void> {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.steamLeakInput) {
        this.surveyService.steamLeakInput.set(this.assessmentCalculator.steamLeakInput);
      } else {
        this.surveyService.initDefaultEmptyInputs(this.activeSettings);
        this.assessmentCalculator.steamLeakInput = this.surveyService.steamLeakInput();
        await this.calculatorDbService.saveAssessmentCalculator(assessment, this.assessmentCalculator);
      }
    } else {
      this.surveyService.initDefaultEmptyInputs(this.activeSettings);
      this.assessmentCalculator = {
        assessmentId: assessment.id,
        steamLeakInput: this.surveyService.steamLeakInput(),
      };
      await this.calculatorDbService.saveAssessmentCalculator(assessment, this.assessmentCalculator);
    }
  }
}