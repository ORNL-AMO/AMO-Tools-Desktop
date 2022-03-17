import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { WallLossCompareService } from '../wall-loss-compare.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WallFormService } from '../../../../calculator/furnaces/wall/wall-form.service';

@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css']
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: FormGroup;
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

  surfaceOptions: Array<WallLossesSurface>;
  showModal: boolean = false;
  idString: string;
  constructor(private wallLossCompareService: WallLossCompareService, private wallFormService: WallFormService, private suiteDbService: SuiteDbService, private lossesService: LossesService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
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
          this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
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

  setProperties() {
    let tmpFactor: WallLossesSurface = this.suiteDbService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
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

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
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


}
