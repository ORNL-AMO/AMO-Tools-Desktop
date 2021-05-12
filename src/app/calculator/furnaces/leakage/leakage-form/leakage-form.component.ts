import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
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

  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: Subscription;

  lossResult: LeakageLossResults;
  isEditingName: boolean;

  trackingEnergySource: boolean;
  idString: string;
  outputSubscription: Subscription;
  treasureHuntUtilityOptions: Array<TreasureHuntUtilityOption>;

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
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    this.initSubscriptions();
    this.energyUnit = this.leakageService.getAnnualEnergyUnit(this.leakageForm.controls.energySourceType.value, this.settings);
    if (this.trackingEnergySource) {
      let energySource = this.leakageService.energySourceType.getValue();
      this.setEnergySource(energySource);
    } else {
      this.leakageService.energySourceType.next(this.leakageForm.controls.energySourceType.value);
    }

    if (this.inTreasureHunt) {
      this.treasureHuntUtilityOptions = treasureHuntUtilityOptions;
    }
    this.setEnergySource();
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
    if (this.trackingEnergySource) {
      this.energySourceTypeSub.unsubscribe();
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
    if (this.trackingEnergySource) {
      this.energySourceTypeSub = this.leakageService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
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

  setEnergySource(baselineEnergySource?: string) {
    if (baselineEnergySource) {
      this.leakageForm.patchValue({
        energySourceType: baselineEnergySource
      });
    }
    this.energyUnit = this.leakageService.getAnnualEnergyUnit(this.leakageForm.controls.energySourceType.value, this.settings);

    if (!this.trackingEnergySource) {
      this.leakageService.energySourceType.next(this.leakageForm.controls.energySourceType.value);
    }
    this.cd.detectChanges();
    this.calculate();
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

    this.calculate();
    this.setFormState();
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

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.roundVal(calculatedAvailableHeat, 1);
      this.leakageForm.patchValue({
        availableHeat: calculatedAvailableHeat
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
