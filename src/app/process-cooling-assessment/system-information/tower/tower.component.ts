import { Component, DestroyRef, inject, Signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { ProcessCoolingAssessment, TowerInput, TowerSizeMetric } from "../../../shared/models/process-cooling-assessment";
import { ProcessCoolingAssessmentService } from "../../services/process-cooling-asessment.service";
import { TowerForm, SystemInformationFormService } from "../system-information-form.service";
import { Settings } from "../../../shared/models/settings";
import { ProcessCoolingUiService } from "../../services/process-cooling-ui.service";
import { FormControlIds, generateFormControlIds } from "../../../shared/helperFunctions";
import { getFanType, getTowerSizeMetrics, getTowerTypes } from "../../constants/process-cooling-constants";
import { TEMPERATURE_HTML } from "../../../shared/app-constants";
import { PROCESS_COOLING_UNITS } from "../../constants/units";

@Component({
  selector: 'app-tower',
  standalone: false,
  templateUrl: './tower.component.html',
  styleUrl: './tower.component.css'
})
export class TowerComponent {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private systemInformationFormService = inject(SystemInformationFormService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup<TowerForm>;
  controlIds: FormControlIds<TowerForm>;
  TEMPERATURE_HTML = TEMPERATURE_HTML;
  PROCESS_COOLING_UNITS = PROCESS_COOLING_UNITS;

  towerTypes = getTowerTypes();
  towerSizeMetrics = getTowerSizeMetrics();
  fanTypes = getFanType();
  TowerSizeMetrics = TowerSizeMetric;

  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  ngOnInit(): void {
    const towerInput: TowerInput = this.processCooling().systemInformation.towerInput;
    this.form = this.systemInformationFormService.getTowerForm(towerInput, this.settings());
    this.controlIds = generateFormControlIds(this.form.controls);
    this.observeFormChanges();
    this.observeTowerTypeChange();
    this.observeTowerSizeChange();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => this.updateAssessment());
  }

  observeTowerTypeChange() {
    this.towerType.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      (towerType) => {
        const dependentValues = this.systemInformationFormService.getTowerTypeDependentValues(towerType);
        this.numberOfFans.setValue(dependentValues.numberOfFans, { emitEvent: false });
        this.fanSpeedType.setValue(dependentValues.fanSpeedType, { emitEvent: false });
        this.updateAssessment();
      }
    );
  }

    observeTowerSizeChange() {
    this.towerSizeMetric.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      (towerSizeMetric) => {
        this.towerSize.setValidators(this.systemInformationFormService.getTowerSizeValidators(towerSizeMetric));
        this.towerSize.updateValueAndValidity({ emitEvent: false });
      });
  }

  updateAssessment() {
    let systemInformation = this.processCooling().systemInformation;
    const towerInput = this.systemInformationFormService.getTowerInput(this.form.getRawValue(), systemInformation.towerInput);
    this.processCoolingAssessmentService.updateSystemInformationProperty('towerInput', towerInput);
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }

  get usesFreeCooling() { return this.form.get('usesFreeCooling'); }
  get isHEXRequired() { return this.form.get('isHEXRequired'); }
  get HEXApproachTemp() { return this.form.get('HEXApproachTemp'); }
  get numberOfTowers() { return this.form.get('numberOfTowers'); }
  get towerType() { return this.form.get('towerType'); }
  get numberOfFans() { return this.form.get('numberOfFans'); }
  get fanSpeedType() { return this.form.get('fanSpeedType'); }
  get towerSizeMetric() { return this.form.get('towerSizeMetric'); }
  get fanType() { return this.form.get('fanType'); }
  get towerSize() { return this.form.get('towerSize'); }

}
