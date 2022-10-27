import { Component, OnInit, Input, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerBlowdownRateService, BoilerBlowdownRateInputs } from '../boiler-blowdown-rate.service';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-blowdown-rate-form',
  templateUrl: './blowdown-rate-form.component.html',
  styleUrls: ['./blowdown-rate-form.component.css']
})
export class BlowdownRateFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  disabled: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;

  conductivityForm: UntypedFormGroup;
  boilerForm: UntypedFormGroup;
  operationsForm: UntypedFormGroup;
  setFormSub: Subscription;
  showBoiler: boolean;
  showBoilerSubscription: Subscription;
  showOperations: boolean;
  showOperationsSubscription: Subscription;
  operatingHoursSubscription: Subscription;
  operatingHours: OperatingHours;
  showOperatingHoursModal: boolean = false;
  idString: string;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_';
    }
    else {
      this.idString = 'modification_';
    }
    this.setFormSub = this.boilerBlowdownRateService.setForms.subscribe(val => {
      this.setForm();
    });
    this.showBoilerSubscription = this.boilerBlowdownRateService.showBoiler.subscribe(val => {
      this.showBoiler = val;
    });
    this.showOperationsSubscription = this.boilerBlowdownRateService.showOperations.subscribe(val => {
      this.showOperations = val;
    });
    this.operatingHoursSubscription = this.boilerBlowdownRateService.operatingHours.subscribe(val => {
      this.operatingHours = val;
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
    this.showBoilerSubscription.unsubscribe();
    this.showOperationsSubscription.unsubscribe();
    this.operatingHoursSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.disabled && changes.disabled.firstChange == false) {
      if (this.disabled == true) {
        this.disableForms();
      } else {
        this.enableForms();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  setForm() {
    if (this.isBaseline == true) {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
      this.conductivityForm = this.boilerBlowdownRateService.getConductivityFormFromObj(inputData);
      this.boilerForm = this.boilerBlowdownRateService.getBoilerFormFromObj(inputData, this.settings);
      this.operationsForm = this.boilerBlowdownRateService.getOperationsFormFromObj(inputData, this.settings);
    } else {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
      if (inputData) {
        this.conductivityForm = this.boilerBlowdownRateService.getConductivityFormFromObj(inputData);
        this.boilerForm = this.boilerBlowdownRateService.getBoilerFormFromObj(inputData, this.settings);
        this.operationsForm = this.boilerBlowdownRateService.getOperationsFormFromObj(inputData, this.settings);
      }
    }
    if (this.disabled == true && this.conductivityForm && this.boilerForm && this.operationsForm) {
      this.disableForms();

    }
  }

  disableForms() {
    this.conductivityForm.disable();
    this.boilerForm.disable();
    this.operationsForm.disable();
  }

  enableForms() {
    this.conductivityForm.enable();
    this.boilerForm.enable();
    this.operationsForm.enable();
  }

  focusField(str: string) {
    this.boilerBlowdownRateService.currentField.next(str);
  }

  focusOut() {
    this.boilerBlowdownRateService.currentField.next('default');
  }

  saveConductivity() {
    if (this.isBaseline == true) {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
      inputData = this.boilerBlowdownRateService.updateObjFromConductivityForm(this.conductivityForm, inputData);
      this.boilerBlowdownRateService.baselineInputs.next(inputData);
    } else {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
      inputData = this.boilerBlowdownRateService.updateObjFromConductivityForm(this.conductivityForm, inputData);
      this.boilerBlowdownRateService.modificationInputs.next(inputData);
    }
  }

  saveBoiler() {
    if (this.isBaseline == true) {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
      inputData = this.boilerBlowdownRateService.updateObjFromBoilerForm(this.boilerForm, inputData);
      this.boilerBlowdownRateService.baselineInputs.next(inputData);
    } else {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
      inputData = this.boilerBlowdownRateService.updateObjFromBoilerForm(this.boilerForm, inputData);
      this.boilerBlowdownRateService.modificationInputs.next(inputData);
    }
  }

  saveOperations() {
    if (this.isBaseline == true) {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
      inputData = this.boilerBlowdownRateService.updateObjFromOperationsForm(this.operationsForm, inputData);
      this.boilerBlowdownRateService.baselineInputs.next(inputData);
    } else {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
      inputData = this.boilerBlowdownRateService.updateObjFromOperationsForm(this.operationsForm, inputData);
      this.boilerBlowdownRateService.modificationInputs.next(inputData);
    }
  }

  toggleOperations() {
    if (this.showOperations == false) {
      this.boilerBlowdownRateService.showOperations.next(true);
      if (this.showBoiler == false) {
        this.boilerBlowdownRateService.showBoiler.next(true);
      }
    } else {
      this.boilerBlowdownRateService.showOperations.next(false);
    }
  }

  toggleBoiler() {
    if (this.showBoiler == false) {
      this.boilerBlowdownRateService.showBoiler.next(true);
    } else {
      this.boilerBlowdownRateService.showBoiler.next(false);
      if (this.showOperations == true) {
        this.boilerBlowdownRateService.showOperations.next(false);
      }
    }
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(updatedHours: OperatingHours) {
    this.operationsForm.controls.operatingHours.patchValue(updatedHours.hoursPerYear);
    this.saveOperations();
    this.closeOperatingHoursModal();
    this.boilerBlowdownRateService.operatingHours.next(updatedHours);
  }
}