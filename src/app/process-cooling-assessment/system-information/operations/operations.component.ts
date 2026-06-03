import { Component, DestroyRef, ElementRef, inject, Signal, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { Co2SavingsData } from "../../../calculator/utilities/co2-savings/co2-savings.service";
import { TEMPERATURE_HTML } from "../../../shared/app-constants";
import { ProcessCoolingAssessment } from "../../../shared/models/process-cooling-assessment";
import { getCondenserCoolingMethods } from "../../constants/process-cooling-constants";
import { ProcessCoolingAssessmentService } from "../../services/process-cooling-assessment.service";
import { OperationsForm, SystemInformationFormService } from "../system-information-form.service";
import { Settings } from "../../../shared/models/settings";
import { ProcessCoolingUiService } from "../../services/process-cooling-ui.service";
import { FormControlIds, generateFormControlIds } from "../../../shared/helperFunctions";
import { PROCESS_COOLING_UNITS } from "../../constants/process-cooling-units";
import { FeatureFlagService } from "../../../shared/feature-flag.service";


// * comments outline some of the pattern and state-handling changes that differ from legacy MEASUR patterns
@Component({
  selector: 'app-operations',
  standalone: false,
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent {
    // * prefer inject() syntax for DI so can expose service signals to template props. inject() is modern and more compatible with unit testing - should we need it
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private systemInformationFormService = inject(SystemInformationFormService);
  private destroyRef = inject(DestroyRef);
  private featureFlagService = inject(FeatureFlagService);
  
  // * use typed forms - get intellisense on properties
  form: FormGroup<OperationsForm>;
  co2SavingsData: Co2SavingsData;

  TEMPERATURE_HTML = TEMPERATURE_HTML;
  PROCESS_COOLING_UNITS = PROCESS_COOLING_UNITS;
  
  showOperatingHoursModal: boolean;
  condenserCoolingMethods = getCondenserCoolingMethods();
  controlIds: FormControlIds<OperationsForm>;
  
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  ngOnInit(): void {
    const operations = this.processCooling().systemInformation.operations;
    this.co2SavingsData = this.processCooling().systemInformation.co2SavingsData;
    this.form = this.systemInformationFormService.getOperationsForm(operations, this.settings());
    this.doChillerLoadSchedulesVary.disable();
    // * new getter for form control ids to create unique id srings when multiple instances of one component (should move to global helpersor global ng service). We need to standardize this across app
    this.controlIds = generateFormControlIds(this.form.controls);

    this.observeFormChanges();
  }

  // * subscribe to form value changes instead of individual onChange handler in template
  // * automatically destroys subscription
  // * can use various rxjs handlers to debounce, filter and run ops
  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
          let systemInformation = this.processCooling().systemInformation;
          // * use getRawValue (includes disabled fields)
          const operations = this.systemInformationFormService.getOperations(this.form.getRawValue(), systemInformation.operations);
          this.processCoolingAssessmentService.updateSystemInformationProperty('operations', operations);
        }
    );
  }

  updateCo2SavingsData(co2SavingsData: Co2SavingsData) {
    this.processCoolingAssessmentService.updateSystemInformationProperty('co2SavingsData', co2SavingsData);
    this.processCoolingAssessmentService.setDefaultWeatherZipcode();
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }

  get fuelCost() {
    return this.form.get('fuelCost');
  }

  get electricityCost() {
    return this.form.get('electricityCost');
  }

  get chilledWaterSupplyTemp() {
    return this.form.get('chilledWaterSupplyTemp');
  }

  get condenserCoolingMethod() {
    return this.form.get('condenserCoolingMethod');
  }

  get doChillerLoadSchedulesVary() {
    return this.form.get('doChillerLoadSchedulesVary');
  }
}
