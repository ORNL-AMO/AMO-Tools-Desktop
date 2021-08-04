import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ChargeMaterialService } from '../charge-material.service';

@Component({
  selector: 'app-material-name-form',
  templateUrl: './material-name-form.component.html',
  styleUrls: ['./material-name-form.component.css']
})
export class MaterialNameFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  index: number;
  materialNameForm: FormGroup;
  isEditingName: boolean;
  materialType: string;
  
  generateExampleSub: Subscription;
  toggleModificationCollapseSub: Subscription;
  resetDataSub: Subscription;

  isMaterialCollapsed: boolean = false;

  constructor(private chargeMaterialService: ChargeMaterialService) { }

  ngOnInit(): void {
    this.initSubscriptions();
    let collapseMapping = this.chargeMaterialService.collapseMapping.getValue();
    this.isMaterialCollapsed = collapseMapping[this.index];
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
    this.resetDataSub = this.chargeMaterialService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.chargeMaterialService.generateExample.subscribe(value => {
      this.initForm();
    });
  }

  initForm() {
    let updatedChargeMaterialData: ChargeMaterial;
    if (this.isBaseline) {
      let baselineData: Array<ChargeMaterial> = this.chargeMaterialService.baselineData.getValue();
      updatedChargeMaterialData = baselineData[this.index];
    } else {
      let modificationData: Array<ChargeMaterial> = this.chargeMaterialService.modificationData.getValue();
      if (modificationData) {
        updatedChargeMaterialData = modificationData[this.index];
      }
    }

    if (updatedChargeMaterialData) {
      this.materialType = updatedChargeMaterialData.chargeMaterialType;
      this.materialNameForm = this.chargeMaterialService.getMaterialNameForm(updatedChargeMaterialData);
    }
  }

  collapseMaterial() {
    this.isMaterialCollapsed = !this.isMaterialCollapsed;
    let collapseMapping = this.chargeMaterialService.collapseMapping.getValue();
    collapseMapping[this.index] = this.isMaterialCollapsed;
    this.chargeMaterialService.collapseMapping.next(collapseMapping);
  }

  editName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
    let chargeMaterial: ChargeMaterial = this.chargeMaterialService.getMaterialObjectFromForm(this.materialNameForm, this.materialType);
    this.chargeMaterialService.updateDataArray(chargeMaterial, this.index, this.isBaseline);
  }

  removeLoss() {
    this.chargeMaterialService.removeLoss(this.index);
  }

  setFormState() {
    if (this.selected == false) {
      this.materialNameForm.disable();
    } else {
      this.materialNameForm.enable();
    }
  }

  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
  }

}
