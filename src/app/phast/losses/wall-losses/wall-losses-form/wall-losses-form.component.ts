import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges } from '@angular/core';
import { WallLossCompareService } from '../wall-loss-compare.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WallLossWarnings, WallLossesService } from '../wall-losses.service';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';

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
  @Input()
  inSetup: boolean;


  @ViewChild('materialModal') public materialModal: ModalDirective;

  surfaceOptions: Array<WallLossesSurface>;
  showModal: boolean = false;
  warnings: WallLossWarnings;
  constructor(private wallLossCompareService: WallLossCompareService, private wallLossesService: WallLossesService, private suiteDbService: SuiteDbService, private lossesService: LossesService) { }

  ngOnInit() {
    this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
    //init warnings
    this.checkWarnings();
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if(changes.baselineSelected){
      if(!changes.baselineSelected.firstChange){
        //on changes to baseline selected enable/disable form
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
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
  //check iputs for errors
  checkWarnings(){
    let tmpLoss: WallLoss = this.wallLossesService.getWallLossFromForm(this.wallLossesForm);
    this.warnings = this.wallLossesService.checkWarnings(tmpLoss);
    let hasWarning: boolean = this.wallLossesService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  //on input/change in form startSavePolling is called, if not called again with 3 seconds save process is triggered
  save() {
    this.checkWarnings();
    this.calculate.emit(true);
    this.saveEmit.emit(true);
  }

  setProperties() {
    let tmpFactor = this.suiteDbService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    this.wallLossesForm.patchValue({
      conditionFactor: this.roundVal(tmpFactor.conditionFactor, 4)
    })
    this.calculate.emit(true);
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
