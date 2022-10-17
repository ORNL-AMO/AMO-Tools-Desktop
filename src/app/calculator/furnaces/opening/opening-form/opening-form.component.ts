import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { OpeningLoss, OpeningLossOutput, OpeningLossResults, ViewFactorInput } from '../../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../../shared/models/settings';
import { OpeningFormService } from '../opening-form.service';
import { OpeningService } from '../opening.service';

import * as _ from 'lodash';
import { treasureHuntUtilityOptions } from '../../furnace-defaults';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';

@Component({
  selector: 'app-opening-form',
  templateUrl: './opening-form.component.html',
  styleUrls: ['./opening-form.component.css']
})
export class OpeningFormComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
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
  treasureHuntFuelCostSub: Subscription;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  
  openingLossesForm: UntypedFormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  outputSubscription: Subscription;
  energySourceTypeSub: Subscription;
  baselineEnergySourceTypeSub: Subscription;
  
  showFlueGasModal: boolean;
  showOperatingHoursModal: boolean;

  formWidth: number;
  energyUnit: string;
  defaultFlueGasModalEnergySource: string;
  totalArea: number;
  idString: string;
  lossResult: OpeningLossResults;
  isEditingName: boolean;
  canCalculateViewFactor: boolean;
  calculateVFWarning: string;

  treasureHuntUtilityOptions: Array<string>;

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
    if (this.inTreasureHunt) {
      this.treasureHuntUtilityOptions = treasureHuntUtilityOptions;
    }

    this.initSubscriptions();
    this.energyUnit = this.openingService.getAnnualEnergyUnit(this.openingLossesForm.controls.energySourceType.value, this.settings);
    this.checkCanCalculateViewFactor();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
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
    if ((this.isBaseline && this.index > 0) || (!this.isBaseline)) {
      this.energySourceTypeSub.unsubscribe();
      if (this.inTreasureHunt) {
        this.treasureHuntFuelCostSub.unsubscribe();
      }
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

    if ((this.isBaseline && this.index > 0) || !this.isBaseline) {
      this.energySourceTypeSub = this.openingService.energySourceType.subscribe(energySourceType => {
        if (energySourceType) {
          this.openingLossesForm.patchValue({ energySourceType: energySourceType });
          this.cd.detectChanges();
          this.calculate();
        }
      });

      if (this.inTreasureHunt) {
        this.treasureHuntFuelCostSub = this.openingService.treasureHuntFuelCost.subscribe(treasureHuntFuelCost => {
          if (treasureHuntFuelCost) {
            this.openingLossesForm.patchValue({ fuelCost: treasureHuntFuelCost });
            this.cd.detectChanges();
            this.calculate();
          }
        });
      }
    }
  }

  setEnergySourceFromToggle(energySourceType: string) {
    this.openingLossesForm.patchValue({
      energySourceType: energySourceType
    });
    this.setEnergyData();
  }

  setEnergyData() {
    let energySourceType = this.openingLossesForm.controls.energySourceType.value;
    this.energyUnit = this.openingService.getAnnualEnergyUnit(energySourceType, this.settings);
    
    if (this.inTreasureHunt) {
      let treasureHuntFuelCost = this.openingService.getTreasureHuntFuelCost(energySourceType, this.settings);
      this.openingLossesForm.patchValue({fuelCost: treasureHuntFuelCost});
      this.openingService.treasureHuntFuelCost.next(treasureHuntFuelCost);
    }
    this.openingService.energySourceType.next(energySourceType);

    this.cd.detectChanges();
    this.defaultFlueGasModalEnergySource = this.openingLossesForm.value.energySourceType;
    this.calculate();
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

    if (this.inTreasureHunt && !this.isBaseline) {
      this.openingLossesForm.controls.energySourceType.disable();
    }
  }

  checkCanCalculateViewFactor() {
    let form: UntypedFormGroup = this.openingLossesForm;
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

  getReadOnlyForm(): UntypedFormGroup {
    let formCopy: UntypedFormGroup = _.cloneDeep(this.openingLossesForm);
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

    this.defaultFlueGasModalEnergySource = this.openingLossesForm.value.energySourceType;
    
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
          let radiusInches = this.openingLossesForm.controls.lengthOfOpening.value / 2;
          let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit);
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

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.openingFormService.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.openingLossesForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
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
