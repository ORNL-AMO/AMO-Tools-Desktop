import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { WallLossCompareService } from '../wall-loss-compare.service';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { WallFormService } from '../../../../calculator/furnaces/wall/wall-form.service';
import { firstValueFrom } from 'rxjs';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css'],
  standalone: false
})
export class WallLossesFormComponent implements OnInit {
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();

  @Input()
  wallLossesForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  lossIndex: number;

  private _baselineSelected: boolean;
  @Input()
  set baselineSelected(isSelected: boolean) {
    this._baselineSelected = isSelected;
    if (this.wallLossesForm && !isSelected) {
      this.wallLossesForm.controls.surfaceShape.disable();
    } else {
      this.setWallSurfaceOptions();
      this.wallLossesForm.controls.surfaceShape.enable();
    }
  }
  get baselineSelected(): boolean {
    return this._baselineSelected;
  }

  private _isBaseline: boolean;
  @Input()
  set isBaseline(val: boolean) {
    this._isBaseline = val;
    this.idString = this._isBaseline ? '_baseline_' + this.lossIndex : '_modification_' + this.lossIndex;
  }
  get isBaseline(): boolean {
    return this._isBaseline;
  }

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  hasDeletedCustomMaterial: boolean = false;
  existingMaterial: WallLossesSurface;
  surfaceOptions: Array<WallLossesSurface>;
  showModal: boolean = false;
  idString: string;
  constructor(private wallLossCompareService: WallLossCompareService,
    private wallFormService: WallFormService,
    private lossesService: LossesService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService) { }

  ngOnInit() {
    this.initForm();
  }

  async initForm() {
    await this.setWallSurfaceOptions();
    if (this.surfaceOptions) {
      if (this.wallLossesForm.controls.surfaceShape.value && this.wallLossesForm.controls.surfaceShape.value !== '') {
        if (this.wallLossesForm.controls.conditionFactor.value === '') {
          this.setConditionFactor();
        } else {
          this.checkForDeletedMaterial();
        }
      }
    }
  }

  async setWallSurfaceOptions() {
    this.surfaceOptions = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  save() {
    this.wallLossesForm = this.wallFormService.setValidators(this.wallLossesForm);
    this.calculate.emit(true);
    this.saveEmit.emit(true);
  }

  async checkForDeletedMaterial() {
    let selectedMaterial: WallLossesSurface = await firstValueFrom(this.wallLossesSurfaceDbService.getByIdWithObservable(this.wallLossesForm.controls.surfaceShape.value));
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    }
    this.save();
  }

  async restoreMaterial() {
    this.existingMaterial = {
      conditionFactor: this.wallLossesForm.controls.conditionFactor.value,
      surface: "Custom Material"
    };
    let addedMaterial = await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(this.existingMaterial));
    this.surfaceOptions = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    this.wallLossesForm.patchValue({
      surfaceShape: addedMaterial.id
    });
    this.existingMaterial.id = addedMaterial.id;
  }


  setConditionFactor() {
    const wallSurface: WallLossesSurface = this.surfaceOptions.find(material => material.id === this.wallLossesForm.controls.surfaceShape.value);
    if (wallSurface) {
      this.wallLossesForm.patchValue({
        conditionFactor: roundVal(wallSurface.conditionFactor, 4)
      });
    }
    this.save();
  }

  showMaterialModal(isNewMaterial: boolean = false) {
    this.existingMaterial = isNewMaterial ? undefined : this.existingMaterial;
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  async hideMaterialModal(materialEvent?: WallLossesSurface) {
    if (materialEvent && materialEvent.id) {
      await this.setWallSurfaceOptions();
      this.wallLossesForm.patchValue({
        surfaceShape: materialEvent.id,
        conditionFactor: roundVal(materialEvent.conditionFactor, 4)
      });
      this.save();
    }
    this.materialModal.hide();
    this.showModal = false;
    this.dismissMessage();
    this.lossesService.modalOpen.next(this.showModal);
  }

  canCompare() {
    if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareSurfaceArea(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareSurfaceArea(this.lossIndex);
    } else {
      return false;
    }
  }

  compareAmbientTemperature(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareAmbientTemperature(this.lossIndex);
    } else {
      return false;
    }
  }

  compareSurfaceTemperature(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareSurfaceTemperature(this.lossIndex);
    } else {
      return false;
    }
  }

  compareWindVelocity(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareWindVelocity(this.lossIndex);
    } else {
      return false;
    }
  }

  compareSurfaceEmissivity(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareSurfaceEmissivity(this.lossIndex);
    } else {
      return false;
    }
  }

  compareSurfaceShape(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareSurfaceShape(this.lossIndex);
    } else {
      return false;
    }
  }

  compareConditionFactor(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareConditionFactor(this.lossIndex);
    } else {
      return false;
    }
  }

  compareCorrectionFactor(): boolean {
    if (this.canCompare()) {
      return this.wallLossCompareService.compareCorrectionFactor(this.lossIndex);
    } else {
      return false;
    }
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
  }


}
