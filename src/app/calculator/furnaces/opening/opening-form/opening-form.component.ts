import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { OpeningLoss, OpeningLossOutput, OpeningLossResults, ViewFactorInput } from '../../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../../shared/models/settings';
import { OpeningFormService } from '../opening-form.service';
import { OpeningService } from '../opening.service';

import * as _ from 'lodash';


@Component({
  selector: 'app-opening-form',
  templateUrl: './opening-form.component.html',
  styleUrls: ['./opening-form.component.css']
})
export class OpeningFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  index: number;

  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  openingLossesForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  outputSubscription: Subscription;
  energySourceTypeSub: Subscription;
  
  showFlueGasModal: boolean;
  showOperatingHoursModal: boolean;

  formWidth: number;
  energyUnit: string;
  totalArea: number;
  trackingEnergySource: boolean;
  idString: string;
  lossResult: OpeningLossResults;
  isEditingName: boolean;
  canCalculateViewFactor: boolean;
  calculateVFWarning: string;

  constructor(private openingFormService: OpeningFormService,
              private convertUnitsService: ConvertUnitsService,
              private cd: ChangeDetectorRef,
              private openingService: OpeningService) { }
  ngOnInit(): void {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.index;
    }
    else {
      this.idString = '_baseline_' + this.index;
    }
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;
    this.initSubscriptions();
    this.energyUnit = this.openingService.getAnnualEnergyUnit(this.openingLossesForm.controls.energySourceType.value, this.settings);
    if (this.trackingEnergySource) {
      let energySource = this.openingService.energySourceType.getValue();
      this.setEnergySource(energySource);
    } else {
      this.openingService.energySourceType.next(this.openingLossesForm.controls.energySourceType.value);
    }
    this.checkCanCalculateViewFactor();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      this.checkEnergySourceSub();
      this.setFormState();
      let output: OpeningLossOutput = this.openingService.output.getValue();
      this.setLossResult(output);
    }
  }

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }


  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSubscription.unsubscribe();
    if (this.trackingEnergySource) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.openingService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.openingService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.openingService.output.subscribe(output => {
      this.setLossResult(output);
    });
    if (this.trackingEnergySource) {
      this.energySourceTypeSub = this.openingService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }
  }

  checkEnergySourceSub() {
    let isCurrentlySubscribed = this.trackingEnergySource;
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    if (!this.trackingEnergySource && isCurrentlySubscribed) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  setLossResult(output: OpeningLossOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  editLossName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  setFormState() {
    if (this.selected == false) {
      this.openingLossesForm.disable();
    } else {
      this.openingLossesForm.enable();
    }
  }

  checkCanCalculateViewFactor() {
    let form: FormGroup = this.openingLossesForm;
    if (!this.selected) {
      form = this.getReadOnlyForm();
    }

    if (form.controls.openingType.value == 'Round' 
      && (form.controls.numberOfOpenings.invalid
      || form.controls.lengthOfOpening.invalid
      )) {
      this.canCalculateViewFactor = false;
    } else if (form.controls.openingType.value == 'Rectangular (or Square)' 
      &&  (form.controls.numberOfOpenings.invalid 
      || form.controls.heightOfOpening.invalid
      || form.controls.lengthOfOpening.invalid
      )) {
      this.canCalculateViewFactor = false;
    } else {
      this.canCalculateViewFactor = true;
    }
  }

  getReadOnlyForm(): FormGroup {
    let formCopy: FormGroup = _.cloneDeep(this.openingLossesForm);
    // enable to read invalid controls
    formCopy.enable();
    // cloneDeep triggers valueChanges/enabled on form
    this.openingLossesForm.disable();
    return formCopy;
  }

  calculateViewFactor() {
    if (!this.canCalculateViewFactor) {
      this.totalArea = 0.0;
      return;
    }
    let vfInputs: ViewFactorInput = this.openingService.getViewFactorInput(this.openingLossesForm);
    let viewFactor: number = this.openingService.getViewFactor(vfInputs, this.settings);
    this.openingLossesForm.patchValue({
      viewFactor: this.openingFormService.roundVal(viewFactor, 3)
    });
    this.calculate();
  }

  checkWarnings() {
    let vfInputs = this.openingService.getViewFactorInput(this.openingLossesForm);
    let calculatedViewFactor = this.openingService.getViewFactor(vfInputs, this.settings);
    this.calculateVFWarning = this.openingFormService.checkCalculateVFWarning(this.openingLossesForm.controls.viewFactor.value, calculatedViewFactor);
  }

  setEnergySource(energySourceType: string) {
    this.openingLossesForm.patchValue({
      energySourceType: energySourceType
    });
    this.energyUnit = this.openingService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (!this.trackingEnergySource) {
      this.openingService.energySourceType.next(energySourceType);
    }
    this.cd.detectChanges();
    this.calculate();
  }


  initForm() {
    let updatedOpeningLossData: OpeningLoss;
    if (this.isBaseline) {
      let baselineData: Array<OpeningLoss> = this.openingService.baselineData.getValue();
      updatedOpeningLossData = baselineData[this.index];
    } else {
      let modificationData: Array<OpeningLoss> = this.openingService.modificationData.getValue();
      if (modificationData) {
        updatedOpeningLossData = modificationData[this.index];
      }
    }
    if (updatedOpeningLossData) {
      this.openingLossesForm = this.openingFormService.getFormFromLoss(updatedOpeningLossData, false);
    } else {
      this.openingLossesForm = this.openingFormService.initForm();
    }

    this.calculate();
    this.setFormState();
  }

  focusField(str: string) {
    this.openingService.currentField.next(str);
  }

  calculate() {
    this.getArea();
    this.checkCanCalculateViewFactor();
    if (this.canCalculateViewFactor) {
      this.checkWarnings();
    }
    this.openingLossesForm = this.openingFormService.setValidators(this.openingLossesForm);
    let currentOpeningLoss: OpeningLoss = this.openingFormService.getLossFromForm(this.openingLossesForm);
    this.openingService.updateDataArray(currentOpeningLoss, this.index, this.isBaseline);
  }

  removeLoss() {
    this.openingService.removeLoss(this.index);
  }

  getArea() {
    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure === 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }
    if (this.openingLossesForm.controls.numberOfOpenings.valid && this.openingLossesForm.controls.lengthOfOpening.valid  && this.openingLossesForm.controls.heightOfOpening.valid) {
      this.totalArea = 0.0;
      if (this.openingLossesForm.controls.openingType.value === 'Round') {
          this.openingLossesForm.patchValue({
            heightOfOpening: 0
          });
          //let radiusFeet = (radiusInches * .08333333) / 2;
          let radiusInches = this.openingLossesForm.controls.lengthOfOpening.value;
          let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit) / 2;
          this.totalArea = Math.PI * Math.pow(radiusFeet, 2) * this.openingLossesForm.controls.numberOfOpenings.value;
      } else if (this.openingLossesForm.controls.openingType.value === 'Rectangular (or Square)') {
          let lengthFeet = 0;
          let heightFeet = 0;
          if (this.openingLossesForm.controls.lengthOfOpening.value) {
            lengthFeet = this.convertUnitsService.value(this.openingLossesForm.controls.lengthOfOpening.value).from(smallUnit).to(largeUnit);
          }
          if (this.openingLossesForm.controls.heightOfOpening.value) {
            heightFeet = this.convertUnitsService.value(this.openingLossesForm.controls.heightOfOpening.value).from(smallUnit).to(largeUnit);
          }
          this.totalArea = lengthFeet * heightFeet * this.openingLossesForm.controls.numberOfOpenings.value;
      } 
    }
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.openingService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.openingFormService.roundVal(calculatedAvailableHeat, 1);
      this.openingLossesForm.patchValue({
        availableHeat: calculatedAvailableHeat
      });
    }
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.openingService.modalOpen.next(this.showFlueGasModal);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.openingService.operatingHours = oppHours;
    this.openingLossesForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
