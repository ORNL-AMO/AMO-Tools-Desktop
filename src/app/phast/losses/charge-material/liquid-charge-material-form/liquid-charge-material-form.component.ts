import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { isInRootDir } from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-liquid-charge-material-form',
  templateUrl: './liquid-charge-material-form.component.html',
  styleUrls: ['./liquid-charge-material-form.component.css']
})
export class LiquidChargeMaterialFormComponent implements OnInit {
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
  dischargeTempError: string = null;
  specificHeatLiquidError: string = null;
  specificHeatVaporError: string = null;
  feedLiquidRateError: string = null;
  chargeVaporError: string = null;
  chargeReactedError: string = null;
  heatOfReactionError: string = null;
  materialLatentHeatError: string = null;
  showModal: boolean = false;
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
    this.materialTypes = this.suiteDbService.selectLiquidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.controls.materialId.value && this.chargeMaterialForm.controls.materialId.value != '') {
        if (this.chargeMaterialForm.controls.materialLatentHeat.value == '') {
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
  // checkDischargeTemp() {
  //   if ((this.chargeMaterialForm.controls.dischargeTemperature > this.chargeMaterialForm.controls.materialVaporizingTemperature.value) && this.chargeMaterialForm.controls.liquidVaporized.value == 0) {
  //     this.dischargeTempError = 'The discharge temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
  //   } else if ((this.chargeMaterialForm.controls.dischargeTemperature < this.chargeMaterialForm.controls.materialVaporizingTemperature.value) && this.chargeMaterialForm.controls.liquidVaporized.value > 0) {
  //     this.dischargeTempError = 'The discharge temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
  //   } else {
  //     this.dischargeTempError = null;
  //   }
  // }


  setProperties() {
    let selectedMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.controls.materialId.value);
    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.vaporizationTemperature = this.convertUnitsService.value(this.roundVal(selectedMaterial.vaporizationTemperature, 4)).from('F').to('C');
      selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
      selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
      selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
    }



    this.chargeMaterialForm.patchValue({
      materialLatentHeat: this.roundVal(selectedMaterial.latentHeat, 4),
      materialSpecificHeatLiquid: this.roundVal(selectedMaterial.specificHeatLiquid, 4),
      materialSpecificHeatVapor: this.roundVal(selectedMaterial.specificHeatVapor, 4),
      materialVaporizingTemperature: this.roundVal(selectedMaterial.vaporizationTemperature, 4)
    })
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
    if (this.chargeMaterialForm.controls.materialSpecificHeatLiquid.value < 0) {
      this.specificHeatLiquidError = 'Specific Heat of Liquid must be equal or greater than 0';
    } else {
      this.specificHeatLiquidError = null;
    }
    if (this.chargeMaterialForm.controls.materialSpecificHeatVapor.value < 0) {
      this.specificHeatVaporError = 'Specific Heat of Vapor must be equal or greater than 0';
    } else {
      this.specificHeatVaporError = null;
    }
    if (this.chargeMaterialForm.controls.feedRate.value < 0) {
      this.feedLiquidRateError = 'Charge Feed Rate must be greater than 0';
    } else {
      this.feedLiquidRateError = null;
    }
    if (this.chargeMaterialForm.controls.liquidVaporized.value < 0 || this.chargeMaterialForm.controls.liquidVaporized.value > 100) {
      this.chargeVaporError = 'Charge Liquid Vaporized must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.chargeVaporError = null;
    }
    if (this.chargeMaterialForm.controls.liquidReacted.value < 0 || this.chargeMaterialForm.controls.liquidReacted.value > 100) {
      this.chargeReactedError = 'Charge Liquid Reacted must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.chargeReactedError = null;
    }
    if (this.chargeMaterialForm.controls.heatOfReaction.value < 0) {
      this.heatOfReactionError = 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      this.heatOfReactionError = null;
    }
    if (this.chargeMaterialForm.controls.materialLatentHeat.value < 0) {
      this.materialLatentHeatError = 'Latent Heat of Vaporization must be equal or greater than 0';
    } else {
      this.materialLatentHeatError = null;
    }

    if ((this.chargeMaterialForm.controls.dischargeTemperature > this.chargeMaterialForm.controls.materialVaporizingTemperature.value) && this.chargeMaterialForm.controls.liquidVaporized.value == 0) {
      this.dischargeTempError = 'The discharge temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
    } else if ((this.chargeMaterialForm.controls.dischargeTemperature < this.chargeMaterialForm.controls.materialVaporizingTemperature.value) && this.chargeMaterialForm.controls.liquidVaporized.value > 0) {
      this.dischargeTempError = 'The discharge temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
    } else {
      this.dischargeTempError = null;
    }

    if (this.specificHeatLiquidError || this.specificHeatVaporError || this.feedLiquidRateError || this.chargeVaporError || this.chargeReactedError || this.heatOfReactionError || this.materialLatentHeatError || this.dischargeTempError) {
      this.inputError.emit(true);
    } else {
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
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.materialId.subscribe((val) => {
          let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
          materialNameElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //materialSpecificHeatLiquid
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.subscribe((val) => {
          let materialSpecificHeatLiquidElements = doc.getElementsByName('materialSpecificHeatLiquid_' + this.lossIndex);
          materialSpecificHeatLiquidElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //materialVaporizingTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.subscribe((val) => {
          let materialVaporizingTemperatureElements = doc.getElementsByName('materialVaporizingTemperature_' + this.lossIndex);
          materialVaporizingTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //materialLatentHeat
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.latentHeat.subscribe((val) => {
          let materialLatentHeatElements = doc.getElementsByName('materialLatentHeat_' + this.lossIndex);
          materialLatentHeatElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //materialSpecificHeatVapor
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.subscribe((val) => {
          let materialSpecificHeatVaporElements = doc.getElementsByName('materialSpecificHeatVapor_' + this.lossIndex);
          materialSpecificHeatVaporElements.forEach(element => {
            element.classList.toggle('indicate-different-db', val);
          });
        })
        //feedRate
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.subscribe((val) => {
          let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
          feedRateElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //initialTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.subscribe((val) => {
          let initialTemperatureElements = doc.getElementsByName('initialTemperature_' + this.lossIndex);
          initialTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //dischargeTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.subscribe((val) => {
          let dischargeTemperatureElements = doc.getElementsByName('dischargeTemperature_' + this.lossIndex);
          dischargeTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //liquidVaporized
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.subscribe((val) => {
          let liquidVaporizedElements = doc.getElementsByName('liquidVaporized_' + this.lossIndex);
          liquidVaporizedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //liquidReacted
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.percentReacted.subscribe((val) => {
          let liquidReactedElements = doc.getElementsByName('liquidReacted_' + this.lossIndex);
          liquidReactedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //heatOfReaction
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.subscribe((val) => {
          let heatOfReactionElements = doc.getElementsByName('heatOfReaction_' + this.lossIndex);
          heatOfReactionElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //endothermicOrExothermic
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.subscribe((val) => {
          let endothermicOrExothermicElements = doc.getElementsByName('endothermicOrExothermic_' + this.lossIndex);
          endothermicOrExothermicElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //additionalHeatRequired
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.subscribe((val) => {
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
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }


  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectLiquidLoadChargeMaterials();
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
    this.lossesService.modalOpen.next(false);
  }
}
