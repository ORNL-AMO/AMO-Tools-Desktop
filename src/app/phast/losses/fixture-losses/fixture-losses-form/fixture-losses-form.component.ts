import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FixtureLossesCompareService } from "../fixture-losses-compare.service";
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css']
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: FormGroup;
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

  specificHeatError: string = null;
  feedRateError: string = null;
  firstChange: boolean = true;
  counter: any;
  materials: Array<any>;
  showModal: boolean = false;
  constructor(private windowRefService: WindowRefService, private fixtureLossesCompareService: FixtureLossesCompareService, private suiteDbService: SuiteDbService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }
  disableForm() {
    this.lossesForm.disable();
  }

  enableForm() {
    this.lossesForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  focusOut() {
    this.changeField.emit('default');
  }
  setSpecificHeat() {
    let tmpMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.controls.materialName.value);
    this.lossesForm.patchValue({
      specificHeat: tmpMaterial.specificHeatSolid
    })
    this.checkInputError();
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.controls.specificHeat.value < 0) {
      this.specificHeatError = 'Specific Heat must be equal or greater than 0';
    } else {
      this.specificHeatError = null;
    }
    if (this.lossesForm.controls.feedRate.value < 0) {
      this.feedRateError = 'Fixture Weight feed rate must be greater than 0';
    } else {
      this.feedRateError = null;
    }

    if(this.specificHeatError || this.feedRateError){
      this.inputError.emit(true);
    }else{
      this.inputError.emit(false);
    }
  }

  startSavePolling() {
    this.calculate.emit(true);
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.fixtureLossesCompareService.baselineFixtureLosses && this.fixtureLossesCompareService.modifiedFixtureLosses && this.fixtureLossesCompareService.differentArray.length != 0) {
      if (this.fixtureLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //materialName
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.materialName.subscribe((val) => {
          let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
          materialNameElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //specificHeat
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.specificHeat.subscribe((val) => {
          let specificHeatElements = doc.getElementsByName('specificHeat_' + this.lossIndex);
          specificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //feedRate
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.feedRate.subscribe((val) => {
          let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
          feedRateElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //initialTemp
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.initialTemperature.subscribe((val) => {
          let initialTempElements = doc.getElementsByName('initialTemp_' + this.lossIndex);
          initialTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //finalTemp
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.finalTemperature.subscribe((val) => {
          let finalTempElements = doc.getElementsByName('finalTemp_' + this.lossIndex);
          finalTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.controls.materialName.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
    }

    this.lossesForm.patchValue({
      specificHeat: this.roundVal(selectedMaterial.specificHeatSolid, 4)
    })
    this.calculate.emit(true);
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
      let newMaterial = this.materials.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.lossesForm.patchValue({
          materialName: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.showModal = false;
    this.materialModal.hide();
    this.lossesService.modalOpen.next(false);
  }
}
