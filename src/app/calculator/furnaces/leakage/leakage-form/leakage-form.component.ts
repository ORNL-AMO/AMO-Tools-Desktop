import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { LeakageLoss, LeakageLossOutput, LeakageLossResults } from '../../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../../shared/models/settings';
import { TreasureHuntUtilityOption, treasureHuntUtilityOptions } from '../../furnace-defaults';
import { LeakageFormService, LeakageWarnings } from '../leakage-form.service';
import { LeakageService } from '../leakage.service';

@Component({
  selector: 'app-leakage-form',
  templateUrl: './leakage-form.component.html',
  styleUrls: ['./leakage-form.component.css']
})
export class LeakageFormComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  index: number;
  @Input()
  selected: boolean;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  warnings: LeakageWarnings;

  leakageForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;
  defaultFlueGasModalEnergySource: string;

  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: Subscription;

  lossResult: LeakageLossResults;
  isEditingName: boolean;

  trackingEnergySource: boolean;
  idString: string;
  outputSubscription: Subscription;
  treasureHuntUtilityOptions: Array<string>;
  treasureHuntFuelCostSub: Subscription;

  constructor(private leakageFormService: LeakageFormService,
    private cd: ChangeDetectorRef,
    private leakageService: LeakageService) { }

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
    this.energyUnit = this.leakageService.getAnnualEnergyUnit(this.leakageForm.controls.energySourceType.value, this.settings);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      this.checkEnergySourceSub();
      let output: LeakageLossOutput = this.leakageService.output.getValue();
      this.setLossResult(output);
    }
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

  checkEnergySourceSub() {
    let isCurrentlySubscribed = this.trackingEnergySource;
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    if (!this.trackingEnergySource && isCurrentlySubscribed) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.leakageService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.leakageService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.leakageService.output.subscribe(output => {
     this.setLossResult(output);
    });
    if ((this.isBaseline && this.index > 0) || !this.isBaseline) {
      this.energySourceTypeSub = this.leakageService.energySourceType.subscribe(energySourceType => {
        if (energySourceType) {
          this.leakageForm.patchValue({ energySourceType: energySourceType });
          this.cd.detectChanges();
          this.calculate();
        }
      });

      if (this.inTreasureHunt) {
        this.treasureHuntFuelCostSub = this.leakageService.treasureHuntFuelCost.subscribe(treasureHuntFuelCost => {
          if (treasureHuntFuelCost) {
            this.leakageForm.patchValue({ fuelCost: treasureHuntFuelCost });
            this.cd.detectChanges();
            this.calculate();
          }
        });
      }
    }

  }

  setLossResult(output: LeakageLossOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.leakageForm.disable();
    } else {
      this.leakageForm.enable();
    }
    if (this.inTreasureHunt && !this.isBaseline) {
      this.leakageForm.controls.energySourceType.disable();
    }
  }

  editLossName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  removeLoss() {
    this.leakageService.removeLoss(this.index);
  }


  initForm() {
    let updatedLeakageLossData: LeakageLoss;
    if (this.isBaseline) {
      let baselineData: Array<LeakageLoss> = this.leakageService.baselineData.getValue();
      updatedLeakageLossData = baselineData[this.index];
    } else {
      let modificationData: Array<LeakageLoss> = this.leakageService.modificationData.getValue();
      if (modificationData) {
        updatedLeakageLossData = modificationData[this.index];
      }
    }

    if (updatedLeakageLossData) {
      this.leakageForm = this.leakageFormService.initFormFromLoss(updatedLeakageLossData, false);
    } else {
      this.leakageForm = this.leakageFormService.initForm();
    }

    this.defaultFlueGasModalEnergySource = this.leakageForm.value.energySourceType;

    this.calculate();
    this.setFormState();
  }

  setEnergySourceFromToggle(energySourceType: string) {
    this.leakageForm.patchValue({
      energySourceType: energySourceType
    });
    this.setEnergyData();
  }

  setEnergyData() {
    let energySourceType = this.leakageForm.controls.energySourceType.value;
    this.energyUnit = this.leakageService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (this.inTreasureHunt) {
      let treasureHuntFuelCost = this.leakageService.getTreasureHuntFuelCost(energySourceType, this.settings);
      this.leakageForm.patchValue({fuelCost: treasureHuntFuelCost});
      this.leakageService.treasureHuntFuelCost.next(treasureHuntFuelCost);
    }
    this.leakageService.energySourceType.next(energySourceType);

    this.cd.detectChanges();
    this.defaultFlueGasModalEnergySource = this.leakageForm.value.energySourceType;
    this.calculate();

  }

  focusField(str: string) {
    this.leakageService.currentField.next(str);
  }

  checkWarnings() {
    let tmpLoss: LeakageLoss = this.leakageFormService.initLossFromForm(this.leakageForm);
    this.warnings = this.leakageFormService.checkLeakageWarnings(tmpLoss);
  }

  calculate() {
    this.checkWarnings();
    let currentLeakageLoss: LeakageLoss = this.leakageFormService.initLossFromForm(this.leakageForm);
    this.leakageService.updateDataArray(currentLeakageLoss, this.index, this.isBaseline);

  }

  roundVal(val: number, digits: number) {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.leakageService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.leakageForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.leakageService.modalOpen.next(this.showFlueGasModal);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.leakageService.operatingHours = oppHours;
    this.leakageForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
