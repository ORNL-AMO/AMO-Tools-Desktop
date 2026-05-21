import {
  Component, ChangeDetectionStrategy, OnInit, OnDestroy,
  inject, input, output,
} from '@angular/core';
import { AirLeakSurveyInput } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { AirLeakSurveyTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { AirLeakSurveyService } from './air-leak-survey.service';

@Component({
  selector: 'app-air-leak-survey',
  templateUrl: './air-leak-survey.component.html',
  styleUrls: ['./air-leak-survey.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,

  standalone: false,
})
export class AirLeakSurveyComponent implements OnInit, OnDestroy {
  readonly inTreasureHunt = input<boolean>(false);
  readonly settings = input<Settings | undefined>(undefined);
  readonly operatingHours = input<OperatingHours | undefined>(undefined);
  readonly assessment = input<Assessment | undefined>(undefined);

  readonly emitSave = output<AirLeakSurveyTreasureHunt>();
  readonly emitCancel = output<boolean>();

  protected readonly surveyService = inject(AirLeakSurveyService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly calculatorDbService = inject(CalculatorDbService);
  private readonly analyticsService = inject(AnalyticsService);

  activeSettings: Settings;
  tabSelect = 'results';
  smallScreenTab = 'form';

  private assessmentCalculator: Calculator | undefined;

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-CA-air-leak');
    this.calculatorDbService.isSaving = false;

    this.activeSettings = this.settings() ?? this.settingsDbService.globalSettings;
    this.surveyService.settings = this.activeSettings;

    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (!this.surveyService.airLeakInput()) {
      this.surveyService.initDefaultEmptyInputs(this.activeSettings);
    }

    const assessment = this.assessment();
    if (assessment) {
      this.getCalculatorForAssessment(assessment);
    }
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
    const surveyInput = this.surveyService.airLeakInput();
    if (surveyInput) {
      this.emitSave.emit({ airLeakSurveyInput: surveyInput as AirLeakSurveyInput, opportunityType: Treasure.airLeak });
    }
  }

  cancel(): void {
    this.emitCancel.emit(true);
  }

  private async getCalculatorForAssessment(assessment: Assessment): Promise<void> {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.airLeakInput) {
        this.surveyService.airLeakInput.set(this.assessmentCalculator.airLeakInput);
      } else {
        this.assessmentCalculator.airLeakInput = this.surveyService.airLeakInput();
      }
    } else {
      this.assessmentCalculator = {
        assessmentId: assessment.id,
        airLeakInput: this.surveyService.airLeakInput(),
      };
      await this.calculatorDbService.saveAssessmentCalculator(assessment, this.assessmentCalculator);
    }
  }
}
