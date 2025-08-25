import { Component, DestroyRef, inject, Signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { tap } from "rxjs";
import { WaterCooledSystemInput, ProcessCoolingAssessment } from "../../../../shared/models/process-cooling-assessment";
import { ProcessCoolingAssessmentService } from "../../../services/process-cooling-asessment.service";
import { WaterCooledSystemInputForm, SystemInformationFormService } from "../../system-information-form.service";
import { Settings } from "../../../../shared/models/settings";
import { ProcessCoolingUiService } from "../../../services/process-cooling-ui.service";
import { FormControlIds, generateFormControlIds } from "../../../../shared/helperFunctions";
import { TEMPERATURE_HTML } from "../../../../shared/app-constants";

@Component({
  selector: 'app-water-cooled',
  standalone: false,
  templateUrl: './water-cooled.component.html',
  styleUrl: './water-cooled.component.css'
})
export class WaterCooledComponent {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly systemInformationFormService = inject(SystemInformationFormService);
  private readonly destroyRef = inject(DestroyRef);

  form: FormGroup<WaterCooledSystemInputForm>;
  controlIds: FormControlIds<WaterCooledSystemInputForm>;
  TEMPERATURE_HTML = TEMPERATURE_HTML;
  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  ngOnInit(): void {
    const waterCooledInput = this.processCooling().systemInformation.waterCooledSystemInput;
    this.form = this.systemInformationFormService.getWaterCooledSystemInputForm(waterCooledInput);
    this.controlIds = generateFormControlIds(this.form.controls);
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      (formValue) => {
        const processCooling = this.processCooling();
        const currentInput: WaterCooledSystemInput = processCooling.systemInformation.waterCooledSystemInput;
        const waterCooledInput = this.systemInformationFormService.getWaterCooledSystemInput(this.form.getRawValue(), currentInput);
        this.processCoolingAssessmentService.updateSystemInformation('waterCooledSystemInput', waterCooledInput);
      }
    );
  }
  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }

  // * use getters for cleaner template
  get isConstantCondenserWaterTemp() {
    return this.form.get('isConstantCondenserWaterTemp');
  }
  get condenserWaterTemp() {
    return this.form.get('condenserWaterTemp');
  }
  get followingTempDifferential() {
    return this.form.get('followingTempDifferential');
  }
}
