import { Component, DestroyRef, inject, Signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { tap } from "rxjs";
import { AirCooledSystemInput, AirCoolingSource, ProcessCoolingAssessment } from "../../../../shared/models/process-cooling-assessment";
import { ProcessCoolingAssessmentService } from "../../../services/process-cooling-asessment.service";
import { AirCooledSystemInputForm, SystemInformationFormService } from "../../system-information-form.service";
import { Settings } from "../../../../shared/models/settings";
import { ProcessCoolingUiService } from "../../../services/process-cooling-ui.service";
import { FormControlIds, generateFormControlIds } from "../../../../shared/helperFunctions";
import { TEMPERATURE_HTML } from "../../../../shared/app-constants";

@Component({
  selector: 'app-air-cooled',
  standalone: false,
  templateUrl: './air-cooled.component.html',
  styleUrl: './air-cooled.component.css'
})
export class AirCooledComponent {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly systemInformationFormService = inject(SystemInformationFormService);
  private readonly destroyRef = inject(DestroyRef);

  form: FormGroup<AirCooledSystemInputForm>;
  controlIds: FormControlIds<AirCooledSystemInputForm>;
  TEMPERATURE_HTML = TEMPERATURE_HTML;
  AirCoolingSource = AirCoolingSource;
  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  ngOnInit(): void {
    const airCooledInput = this.processCooling().systemInformation.airCooledSystemInput;
    this.form = this.systemInformationFormService.getAirCooledSystemInputForm(airCooledInput);
    this.controlIds = generateFormControlIds(this.form.controls);
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      (formValue) => {
        const processCooling = this.processCooling();
        const currentInput: AirCooledSystemInput = processCooling.systemInformation.airCooledSystemInput;
        const airCooledInput = this.systemInformationFormService.getAirCooledSystemInput(this.form.getRawValue(), currentInput);
        this.processCoolingAssessmentService.updateSystemInformationProperty('airCooledSystemInput', airCooledInput);
      }
    );
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }

  // * use getters for cleaner template
  get outdoorAirTemp() {
    return this.form.get('outdoorAirTemp');
  }
  get airCoolingSource() {
    return this.form.get('airCoolingSource');
  }
  get indoorTemp() {
    return this.form.get('indoorTemp');
  }
  get followingTempDifferential() {
    return this.form.get('followingTempDifferential');
  }
}
