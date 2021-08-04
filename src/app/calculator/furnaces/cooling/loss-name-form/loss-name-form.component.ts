import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService } from '../cooling-form.service';
import { CoolingService } from '../cooling.service';

@Component({
  selector: 'app-loss-name-form',
  templateUrl: './loss-name-form.component.html',
  styleUrls: ['./loss-name-form.component.css']
})
export class LossNameFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  index: number;
  lossNameForm: FormGroup;
  isEditingName: boolean;
  coolingMedium: string;
  
  generateExampleSub: Subscription;
  toggleModificationCollapseSub: Subscription;
  resetDataSub: Subscription;

  constructor(private coolingFormService: CoolingFormService,
    private coolingService: CoolingService) { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
        this.setFormState();
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initSubscriptions() {
    this.resetDataSub = this.coolingService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.coolingService.generateExample.subscribe(value => {
      this.initForm();
    });
  }

  initForm() {
    let updatedCoolingLossData: CoolingLoss;
    if (this.isBaseline) {
      let baselineData: Array<CoolingLoss> = this.coolingService.baselineData.getValue();
      updatedCoolingLossData = baselineData[this.index];
    } else {
      let modificationData: Array<CoolingLoss> = this.coolingService.modificationData.getValue();
      if (modificationData) {
        updatedCoolingLossData = modificationData[this.index];
      }
    }

    if (updatedCoolingLossData) {
      this.coolingMedium = updatedCoolingLossData.coolingMedium;
      if (this.coolingMedium = 'Liquid') {
        this.lossNameForm = this.coolingFormService.initLiquidFormFromLoss(updatedCoolingLossData);
      } else if(this.coolingMedium = 'Gas') {
        this.lossNameForm = this.coolingFormService.initGasFormFromLoss(updatedCoolingLossData);
      } 
    }
  }

  editName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;

    let coolingLoss: CoolingLoss;
    if (this.coolingMedium == 'Liquid') {
      coolingLoss = this.coolingFormService.initLiquidLossFromForm(this.lossNameForm);
    } else if(this.coolingMedium == 'Gas') {
      coolingLoss = this.coolingFormService.initGasLossFromForm(this.lossNameForm);
    }

    this.coolingService.updateDataArray(coolingLoss, this.index, this.isBaseline);
  }

  removeLoss() {
    this.coolingService.removeLoss(this.index);
  }

  setFormState() {
    if (this.selected == false) {
      this.lossNameForm.disable();
    } else {
      this.lossNameForm.enable();
    }
  }

  focusField(str: string) {
    this.coolingService.currentField.next(str);
  }

}
