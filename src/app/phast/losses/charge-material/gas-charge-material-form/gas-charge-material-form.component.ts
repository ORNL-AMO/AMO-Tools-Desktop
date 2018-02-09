import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-gas-charge-material-form',
  templateUrl: './gas-charge-material-form.component.html',
  styleUrls: ['./gas-charge-material-form.component.css']
})
export class GasChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: FormGroup;
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
  firstChange: boolean = true;
  materialTypes: any;
  selectedMaterial: any;
  counter: any;
  showModal: boolean = false;
  dischargeTempError: string = null;
  specificHeatGasError: string = null;
  feedGasRateError: string = null;
  gasMixVaporError: string = null;
  specificHeatGasVaporError: string = null;
  feedGasReactedError: string = null;
  heatOfReactionError: string = null;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

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
    this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value != '') {
        if (this.chargeMaterialForm.controls.materialSpecificHeat.value == '') {
          this.setProperties();
        }
      }
    }
    this.checkInputError(true);
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  ngOnDestroy() {
    this.lossesService.modalOpen.next(false);
  }


  disableForm() {
    this.chargeMaterialForm.disable();
  }

  enableForm() {
    this.chargeMaterialForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
  setProperties() {
    let selectedMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
    }
    this.chargeMaterialForm.patchValue({
      materialSpecificHeat: this.roundVal(selectedMaterial.specificHeatVapor, 4)
    });
    this.calculate.emit(true);
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
  emitSave() {
    this.saveEmit.emit(true);
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.chargeMaterialForm.controls.materialSpecificHeat.value < 0) {
      this.specificHeatGasError = 'Specific Heat of Gas must be equal or greater than 0';
    } else {
      this.specificHeatGasError = null;
    }
    if (this.chargeMaterialForm.controls.feedRate.value < 0) {
      this.feedGasRateError = 'Feed Rate for Gas Mixture must be greater than 0';
    } else {
      this.feedGasRateError = null;
    }
    if (this.chargeMaterialForm.controls.vaporInGas.value < 0 || this.chargeMaterialForm.controls.vaporInGas.value > 100) {
      this.gasMixVaporError = 'Vapor in Gas Mixture must be equal or greater  than 0 and less than or equal to 100%';
    } else {
      this.gasMixVaporError = null;
    }
    if (this.chargeMaterialForm.controls.specificHeatOfVapor.value < 0) {
      this.specificHeatGasVaporError = 'Specific Heat of Vapor must be equal or greater than 0';
    } else {
      this.specificHeatGasVaporError = null;
    }
    if (this.chargeMaterialForm.controls.gasReacted.value < 0 || this.chargeMaterialForm.controls.gasReacted.value > 100) {
      this.feedGasReactedError = 'Feed Gas Reacted must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.feedGasReactedError = null;
    }
    if (this.chargeMaterialForm.controls.heatOfReaction.value < 0) {
      this.heatOfReactionError = 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      this.heatOfReactionError = null;
    }

    if(this.specificHeatGasError || this.feedGasRateError || this.gasMixVaporError || this.specificHeatGasVaporError || this.feedGasReactedError || this.heatOfReactionError){
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
    if (this.chargeMaterialCompareService.baselineMaterials && this.chargeMaterialCompareService.modifiedMaterials && this.chargeMaterialCompareService.differentArray.length != 0) {
      if (this.chargeMaterialCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //materialName
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.materialId.subscribe((val) => {
          let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
          materialNameElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //materialSpecificHeat
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.subscribe((val) => {
          let materialSpecificHeatElements = doc.getElementsByName('materialSpecificHeat_' + this.lossIndex);
          materialSpecificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //feedRate
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.feedRate.subscribe((val) => {
          let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
          feedRateElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //vaporInGas
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.percentVapor.subscribe((val) => {
          let vaporInGasElements = doc.getElementsByName('vaporInGas_' + this.lossIndex);
          vaporInGasElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //initialTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.initialTemperature.subscribe((val) => {
          let initialTemperatureElements = doc.getElementsByName('initialTemperature_' + this.lossIndex);
          initialTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //dischargeTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.subscribe((val) => {
          let dischargeTemperatureElements = doc.getElementsByName('dischargeTemperature_' + this.lossIndex);
          dischargeTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //specificHeatOfVapor
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.subscribe((val) => {
          let specificHeatOfVaporElements = doc.getElementsByName('specificHeatOfVapor_' + this.lossIndex);
          specificHeatOfVaporElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //gasReacted
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.percentReacted.subscribe((val) => {
          let gasReactedElements = doc.getElementsByName('gasReacted_' + this.lossIndex);
          gasReactedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //heatOfReaction
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.reactionHeat.subscribe((val) => {
          let heatOfReactionElements = doc.getElementsByName('heatOfReaction_' + this.lossIndex);
          heatOfReactionElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //endothermicOrExothermic
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.subscribe((val) => {
          let endothermicOrExothermicElements = doc.getElementsByName('endothermicOrExothermic_' + this.lossIndex);
          endothermicOrExothermicElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //additionalHeatRequired
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.additionalHeat.subscribe((val) => {
          let additionalHeatRequiredElements = doc.getElementsByName('additionalHeatRequired_' + this.lossIndex);
          additionalHeatRequiredElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
    this.calculate.emit(true);
  }
}
