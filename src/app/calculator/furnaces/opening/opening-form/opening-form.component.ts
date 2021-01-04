import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { OpeningLoss, ViewFactorInput } from '../../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { OpeningFormService } from '../opening-form.service';
import { OpeningService } from '../opening.service';

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

  openingLossesForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;

  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: any;
  totalArea: number;
  trackingEnergySource: boolean;
  idString: string;

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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
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
    if (this.trackingEnergySource) {
      this.energySourceTypeSub = this.openingService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.openingLossesForm.disable();
    } else {
      this.openingLossesForm.enable();
    }
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
      updatedOpeningLossData = this.openingService.baselineData.getValue();
    } else {
      updatedOpeningLossData = this.openingService.modificationData.getValue();
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
    // this.calculateViewFactor();

    this.openingLossesForm = this.openingFormService.setValidators(this.openingLossesForm);
    let currentOpeningLoss: OpeningLoss = this.openingFormService.getLossFromForm(this.openingLossesForm);
    if (this.isBaseline) {
      this.openingService.baselineData.next(currentOpeningLoss);
    } else {
      this.openingService.modificationData.next(currentOpeningLoss);
    }
  }

  // TODO is this used?
  calculateViewFactor() {
    this.totalArea = 0;
    if (this.openingLossesForm.controls.numberOfOpenings.valid 
      && this.openingLossesForm.controls.lengthOfOpening.valid  
      && this.openingLossesForm.controls.heightOfOpening.valid) { 
        let vfInputs: ViewFactorInput = this.openingFormService.getViewFactorInput(this.openingLossesForm);
        let viewFactor = this.openingService.getViewFactor(vfInputs, this.settings);
        this.openingLossesForm.patchValue({
          viewFactor: this.roundVal(viewFactor, 3)
        });
        // this.calculate();
    }
  }

  getArea() {
    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure === 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }
    this.totalArea = 0.0;
    if (this.openingLossesForm.controls.numberOfOpenings.valid && this.openingLossesForm.controls.lengthOfOpening.valid  && this.openingLossesForm.controls.heightOfOpening.valid) {
      if (this.openingLossesForm.controls.openingType.value === 'Round') {
          this.openingLossesForm.controls.heightOfOpening.setValue(0);
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

  roundVal(val: number, digits: number) {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.openingService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.roundVal(calculatedAvailableHeat, 1);
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
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
