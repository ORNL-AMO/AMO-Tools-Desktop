import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { WallLossCompareService } from '../wall-loss-compare.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

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
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  @ViewChild('materialModal') public materialModal: ModalDirective;

  windVelocityError: string = null;
  surfaceAreaError: string = null;
  firstChange: boolean = true;
  counter: any;
  surfaceTmpError: string = null;
  emissivityError: string = null;
  surfaceEmissivityError: string = null;
  surfaceOptions: Array<WallLossesSurface>;
  showModal: boolean = false;
  constructor(private wallLossCompareService: WallLossCompareService, private suiteDbService: SuiteDbService, private lossesService: LossesService) { }

  ngOnInit() {
    this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
    //init warnings
    this.checkInputError(true);
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //on changes to baseline selected enable/disable form
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  //iterate through form elements and disable
  disableForm() {
    this.wallLossesForm.disable();
  }
  //iterate through form elements and enable
  enableForm() {
    this.wallLossesForm.enable();
  }

  //emits to wall-losses.component the focused field changed
  focusField(str: string) {
    this.changeField.emit(str);
  }
  //emits to default help on blur of input elements
  focusOut() {
    this.changeField.emit('default');
  }
  //check iputs for errors
  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.wallLossesForm.controls.windVelocity.value < 0) {
      this.windVelocityError = 'Wind Velocity must be equal or greater than 0';
    } else {
      this.windVelocityError = null;
    }
    if (this.wallLossesForm.controls.surfaceArea.value < 0) {
      this.surfaceAreaError = 'Total Outside Surface Area must be equal or greater than 0';
    } else {
      this.surfaceAreaError = null;
    }

    if (this.wallLossesForm.controls.avgSurfaceTemp.value < this.wallLossesForm.controls.ambientTemp.value) {
      this.surfaceTmpError = 'Surface temperature lower is than ambient temperature';
    } else {
      this.surfaceTmpError = null;
    }
    if (this.wallLossesForm.controls.surfaceEmissivity.value > 1 || this.wallLossesForm.controls.surfaceEmissivity.value < 0) {
      this.emissivityError = 'Surface emissivity must be between 0 and 1';
    } else {
      this.emissivityError = null;
    }

    if (this.windVelocityError || this.surfaceAreaError || this.surfaceTmpError || this.emissivityError) {
      this.inputError.emit(true);
      this.wallLossCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.wallLossCompareService.inputError.next(false);
    }
  }

  //on input/change in form startSavePolling is called, if not called again with 3 seconds save process is triggered
  startSavePolling() {
    this.calculate.emit(true);
    this.saveEmit.emit(true);
  }


  setProperties() {
    let tmpFactor = this.suiteDbService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    this.wallLossesForm.patchValue({
      conditionFactor: this.roundVal(tmpFactor.conditionFactor, 4)
    })
    this.calculate.emit(true);
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
      let newMaterial = this.surfaceOptions.filter(material => { return material.surface == event.surface })
      if (newMaterial.length != 0) {
        this.wallLossesForm.patchValue({
          surfaceShape: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
  }
  canCompare() {
    if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses) {
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
