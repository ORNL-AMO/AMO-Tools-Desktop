import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { WallLossCompareService } from '../wall-loss-compare.service';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { WallFormService } from '../../../../calculator/furnaces/wall/wall-form.service';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { firstValueFrom } from 'rxjs';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';

@Component({
    selector: 'app-wall-losses-form',
    templateUrl: './wall-losses-form.component.html',
    styleUrls: ['./wall-losses-form.component.css'],
    standalone: false
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;


  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  hasDeletedCustomMaterial: boolean = false;
  editExistingMaterial: boolean;
  existingMaterial: WallLossesSurface;
  surfaceOptions: Array<WallLossesSurface>;
  showModal: boolean = false;
  idString: string;
  constructor(private wallLossCompareService: WallLossCompareService, private sqlDbApiService: SqlDbApiService, private wallFormService: WallFormService, private lossesService: LossesService, private wallLossesSurfaceDbService: WallLossesSurfaceDbService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.surfaceOptions = this.sqlDbApiService.selectWallLossesSurface();
    if (this.surfaceOptions) {
      if (this.wallLossesForm.controls.surfaceShape.value && this.wallLossesForm.controls.surfaceShape.value !== '') {
        if (this.wallLossesForm.controls.conditionFactor.value === '') {
          this.setProperties();
        } else {
          this.checkForDeletedMaterial();
        }
      }
    }
    //init warnings
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        //on changes to baseline selected enable/disable form
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.surfaceOptions = this.sqlDbApiService.selectWallLossesSurface();
          this.enableForm();
        }
      }
    }
  }

  //disable select input fields
  disableForm() {
    this.wallLossesForm.controls.surfaceShape.disable();
  }
  //enable select input fields
  enableForm() {
    this.wallLossesForm.controls.surfaceShape.enable();
  }

  //emits to wall-losses.component the focused field changed
  focusField(str: string) {
    this.changeField.emit(str);
  }
  //emits to default help on blur of input elements
  focusOut() {
    this.changeField.emit('default');
  }

  save() {
    this.wallLossesForm = this.wallFormService.setValidators(this.wallLossesForm);
    this.calculate.emit(true);
    this.saveEmit.emit(true);
  }

  checkForDeletedMaterial() {
    let selectedMaterial: WallLossesSurface = this.sqlDbApiService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    if (!selectedMaterial) {
      this.hasDeletedCustomMaterial = true;
      this.restoreMaterial();
    }
    this.save();
  }

  async restoreMaterial() {
    let customMaterial: WallLossesSurface = {
      conditionFactor: this.wallLossesForm.controls.conditionFactor.value,
      surface: "Custom Material"
    };
    let suiteDbResult = this.sqlDbApiService.insertWallLossesSurface(customMaterial);
    if (suiteDbResult === true) {
      await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(customMaterial));
    }
    this.surfaceOptions = this.sqlDbApiService.selectWallLossesSurface();
    let newMaterial: WallLossesSurface = this.surfaceOptions.find(material => { return material.surface === customMaterial.surface; });
    this.wallLossesForm.patchValue({
      surfaceShape: newMaterial.id
    });
  }


  setProperties() {
    let tmpFactor: WallLossesSurface = this.sqlDbApiService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    if (tmpFactor) {
      this.wallLossesForm.patchValue({
        conditionFactor: this.roundVal(tmpFactor.conditionFactor, 4)
      });
      this.calculate.emit(true);
    }
    this.save();
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    if(editExistingMaterial === true) {
      this.existingMaterial = {
        conditionFactor: this.wallLossesForm.controls.conditionFactor.value,
        surface: "Custom Material"
      };
    }
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.surfaceOptions = this.sqlDbApiService.selectWallLossesSurface();
      let newMaterial: WallLossesSurface = this.surfaceOptions.find(material => { return material.surface === event.surface; });
      if (newMaterial) {
        this.wallLossesForm.patchValue({
          surfaceShape: newMaterial.id
        });
        this.setProperties();
      }
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
