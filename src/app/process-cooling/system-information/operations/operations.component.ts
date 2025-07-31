import { Component, DestroyRef, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Co2SavingsData } from '../../../calculator/utilities/co2-savings/co2-savings.service';
import { FormControlIds, generateFormControlIds, ProcessCoolingService } from '../../process-cooling.service';
import { Settings } from '../../../shared/models/settings';
import { OperationsForm, SystemInformationFormService } from '../system-information-form.service';
import { OperatingHours } from '../../../shared/models/operations';
import { debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { getCondenserCoolingMethods } from '../../process-cooling-constants';


// * outline changes from typical MEASUR patterns
@Component({
  selector: 'app-operations',
  standalone: false,
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.css'
})
export class OperationsComponent {
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  // * prefer resizeObserver over onResize - only triggers on element change, not viewport
  private resizeObserver: ResizeObserver;

  // * use typed forms - get intellisense on properties
  form: FormGroup<OperationsForm>;
  co2SavingsData: Co2SavingsData;

  TEMPERATURE_HTML = TEMPERATURE_HTML;
  showOperatingHoursModal: boolean;
  condenserCoolingMethods = getCondenserCoolingMethods();
  controlIds: FormControlIds<OperationsForm>;
  formWidth: number = 0;

  // * prefer inject() syntax for DI so can expose service signals to template props. inject() is modern and more compatible with unit testing - should we need it
  private processCoolingAssessmentService = inject(ProcessCoolingService);
  private systemInformationFormService = inject(SystemInformationFormService);
  private destroyRef = inject(DestroyRef);

  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  settings: Signal<Settings> = this.processCoolingAssessmentService.settingsSignal;

  ngOnInit(): void {
    const operations = this.processCooling().systemInformation.operations;
    this.co2SavingsData = this.processCooling().systemInformation.co2SavingsData;
    this.form = this.systemInformationFormService.getOperationsForm(operations);
    // * new getter for form control ids to create unique id srings when multiple instances of one component (should move to global helpersor global ng service). We need to standardize this across app
    this.controlIds = generateFormControlIds(this.form.controls);

    this.observeFormChanges();
    this.observeZipCodeChanges();
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(entries => {
        this.formWidth = entries[0].contentRect.width;
    });
    if (this.formElement?.nativeElement) {
      this.resizeObserver.observe(this.formElement.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver && this.formElement?.nativeElement) {
      this.resizeObserver.unobserve(this.formElement.nativeElement);
    }
  }

  // * subscribe to form value changes instead of individual onChange handler in template
  // * automatically destroys subscription
  // * can use various rxjs handlers to debounce, filter and run ops
  observeFormChanges() {
    this.form.valueChanges.pipe(
      tap(formValue => {
        let systemInformation = this.processCooling().systemInformation;
        // * use getRawValue (includes disabled fields)
        const operations = this.systemInformationFormService.getOperations(this.form.getRawValue(), systemInformation.operations);
        this.processCoolingAssessmentService.updateSystemInformation('operations', operations);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  observeZipCodeChanges() {
    this.zipcode.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      switchMap(zipcode => this.processZipcodeChange(zipcode)),
      tap(result => {
        console.log('Zipcode processing result:', result);
        this.setLocationData(result);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  updateCo2SavingsData(co2SavingsData: Co2SavingsData) {
    this.processCoolingAssessmentService.updateSystemInformation('co2SavingsData', co2SavingsData);
  }

  // todo move to service
  processZipcodeChange(zipcode: number) {
    // this.processCoolingAssessmentService.processZipcodeChange(zipcode)
    return of(zipcode);
  }

  // todo move to service
  // signal on service consumed in this component
  setLocationData(zipcode: number): void {
  }

  focusField(str: string) {
    this.processCoolingAssessmentService.focusedField.next(str);
  }

  closeOperatingHoursModal() {
    // can remove flag when is signal
    this.showOperatingHoursModal = false;
    this.processCoolingAssessmentService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    // can remove flag when is signal
    this.showOperatingHoursModal = true;
    this.processCoolingAssessmentService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.annualOperatingHours.patchValue(oppHours.hoursPerYear);
    this.closeOperatingHoursModal();
  }

  // * use getters for cleaner template - shortened obj notation, no ng if in markup, future proofing
  get annualOperatingHours() {
    return this.form.get('annualOperatingHours');
  }

  get fuelCost() {
    return this.form.get('fuelCost');
  }

  get electricityCost() {
    return this.form.get('electricityCost');
  }

  get zipcode() {
    return this.form.get('zipcode');
  }

  get chilledWaterSupplyTemp() {
    return this.form.get('chilledWaterSupplyTemp');
  }

  get condenserCoolingMethod() {
    return this.form.get('condenserCoolingMethod');
  }
}
