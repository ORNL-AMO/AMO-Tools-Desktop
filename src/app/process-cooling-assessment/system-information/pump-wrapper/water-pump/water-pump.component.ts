
import { Component, DestroyRef, ElementRef, inject, Input, Signal, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { tap } from "rxjs";
import { CoolingWaterPumpType, ProcessCoolingAssessment } from "../../../../shared/models/process-cooling-assessment";
import { ProcessCoolingAssessmentService } from "../../../services/process-cooling-asessment.service";
import { PumpInputForm, SystemInformationFormService } from "../../system-information-form.service";
import { Settings } from "../../../../shared/models/settings";
import { ProcessCoolingUiService } from "../../../services/process-cooling-ui.service";
import { FormControlIds, generateFormControlIds } from "../../../../shared/helperFunctions";

@Component({
  selector: 'app-water-pump',
  standalone: false,
  templateUrl: './water-pump.component.html',
  styleUrl: './water-pump.component.css'
})
export class WaterPumpComponent {
  @Input({ required: true }) pumpFormType!: CoolingWaterPumpType;
  
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private systemInformationFormService = inject(SystemInformationFormService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup<PumpInputForm>;
  controlIds: FormControlIds<PumpInputForm>;
  formWidth: number = 0;

  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  ngOnInit(): void {
    const pumpInput = this.processCooling().systemInformation[this.pumpFormType];
    this.form = this.systemInformationFormService.getPumpInputForm(pumpInput);
    this.controlIds = generateFormControlIds(this.form.controls);
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      (formValue) => {
        const processCooling = this.processCooling();
        const currentPumpInput = processCooling?.systemInformation[this.pumpFormType];
        const pumpInput = this.systemInformationFormService.getPumpInput(formValue, currentPumpInput);
        this.processCoolingAssessmentService.updateSystemInformationProperty(this.pumpFormType, pumpInput);
      }
    );
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }

  get variableFlow() {
    return this.form.get('variableFlow');
  }

  get flowRate() {
    return this.form.get('flowRate');
  }

  get efficiency() {
    return this.form.get('efficiency');
  }

  get motorSize() {
    return this.form.get('motorSize');
  }

  get motorEfficiency() {
    return this.form.get('motorEfficiency');
  }
}
