import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { FormGroup } from '@angular/forms';
import { FlueGasByVolume, FlueGasWarnings, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { FlueGasFormService } from '../../../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flue-gas-losses-form-volume',
  templateUrl: './flue-gas-losses-form-volume.component.html',
  styleUrls: ['./flue-gas-losses-form-volume.component.css']
})
export class FlueGasLossesFormVolumeComponent implements OnInit {
  @Input()
  flueGasLossForm: FormGroup;
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

  @ViewChild('modalBody', { static: false }) public modalBody: ElementRef;
  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getBodyHeight();
  }

  bodyHeight: number;
  moistureModalSub: Subscription;

  firstChange: boolean = true;
  options: Array<FlueGasMaterial>;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  warnings: FlueGasWarnings;
  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  showModal: boolean = false;
  idString: string;
  showMoisture: boolean = false;

  constructor(private suiteDbService: SuiteDbService,
    private flueGasCompareService: FlueGasCompareService,
    private flueGasFormService: FlueGasFormService,
    private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.controls.gasTypeId.value && this.flueGasLossForm.controls.gasTypeId.value !== '') {
        if (this.flueGasLossForm.controls.CH4.value === '' || !this.flueGasLossForm.controls.CH4.value) {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.calcExcessAir();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.options = this.suiteDbService.selectGasFlueGasMaterials();
          this.enableForm();
        }
      }
    }
  }

  ngAfterViewInit() {
    this.moistureModalSub = this.moistureModal.onShown.subscribe(() => {
      this.getBodyHeight();
    });
  }

  ngOnDestroy() {
    this.moistureModalSub.unsubscribe();
  }


  focusOut() {
    this.changeField.emit('default');
  }

  disableForm() {
    this.flueGasLossForm.controls.gasTypeId.disable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.disable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  enableForm() {
    this.flueGasLossForm.controls.gasTypeId.enable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.enable();
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.calcExcessAir();
    this.save();
  }

  calcExcessAir() {
    let input: MaterialInputProperties = {
      CH4: this.flueGasLossForm.controls.CH4.value,
      C2H6: this.flueGasLossForm.controls.C2H6.value,
      N2: this.flueGasLossForm.controls.N2.value,
      H2: this.flueGasLossForm.controls.H2.value,
      C3H8: this.flueGasLossForm.controls.C3H8.value,
      C4H10_CnH2n: this.flueGasLossForm.controls.C4H10_CnH2n.value,
      H2O: this.flueGasLossForm.controls.H2O.value,
      CO: this.flueGasLossForm.controls.CO.value,
      CO2: this.flueGasLossForm.controls.CO2.value,
      SO2: this.flueGasLossForm.controls.SO2.value,
      O2: this.flueGasLossForm.controls.O2.value,
      o2InFlueGas: this.flueGasLossForm.controls.o2InFlueGas.value,
      excessAir: this.flueGasLossForm.controls.excessAirPercentage.value
    };

    if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Oxygen in Flue Gas') {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
      } else {
        this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
      }
      this.flueGasLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    }
    else if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;
      } else {
        this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
      }
      this.flueGasLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
    this.save();
  }

  checkWarnings() {
    let tmpLoss: FlueGasByVolume = this.flueGasFormService.buildByVolumeLossFromForm(this.flueGasLossForm).flueGasByVolume;
    this.warnings = this.flueGasFormService.checkFlueGasByVolumeWarnings(tmpLoss, this.settings);
    let hasWarning: boolean = this.flueGasFormService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  setProperties() {
    let tmpFlueGas: FlueGasMaterial = this.suiteDbService.selectGasFlueGasMaterialById(this.flueGasLossForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
      this.flueGasLossForm.patchValue({
        CH4: this.roundVal(tmpFlueGas.CH4, 4),
        C2H6: this.roundVal(tmpFlueGas.C2H6, 4),
        N2: this.roundVal(tmpFlueGas.N2, 4),
        H2: this.roundVal(tmpFlueGas.H2, 4),
        C3H8: this.roundVal(tmpFlueGas.C3H8, 4),
        C4H10_CnH2n: this.roundVal(tmpFlueGas.C4H10_CnH2n, 4),
        H2O: this.roundVal(tmpFlueGas.H2O, 4),
        CO: this.roundVal(tmpFlueGas.CO, 4),
        CO2: this.roundVal(tmpFlueGas.CO2, 4),
        SO2: this.roundVal(tmpFlueGas.SO2, 4),
        O2: this.roundVal(tmpFlueGas.O2, 4)
      });
    }
    this.save();
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  save() {
    this.flueGasLossForm = this.flueGasFormService.setValidators(this.flueGasLossForm);
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.flueGasLossForm.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
    this.save();
  }

  
  showMoistureModal() {
    this.showMoisture = true;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.moistureModal.show();
  }

  hideMoistureModal(moistureInAirCombustion?: number) {
    if (moistureInAirCombustion) {
      moistureInAirCombustion = Number(moistureInAirCombustion.toFixed(2));
      this.flueGasLossForm.controls.moistureInAirCombustion.patchValue(moistureInAirCombustion);
    }
    this.moistureModal.hide();
    this.showMoisture = false;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.save();
  }

  canCompare() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss && !this.inSetup) {
      if (this.flueGasCompareService.compareLossType(this.lossIndex) === false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  compareVolumeGasTypeId() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeGasTypeId(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeFlueGasTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeFlueGasTemperature(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeAmbientAirTemp() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeAmbientAirTemp(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeMoistureInAirCombustion() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeMoistureInAirCombustion(this.lossIndex);
    } else {
      return false;
    }
  }

  compareVolumeExcessAirPercentage() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeExcessAirPercentage(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeCombustionAirTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeCombustionAirTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeFuelTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeFuelTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVolumeOxygenCalculationMethod() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareVolumeOxygenCalculationMethod(this.lossIndex);
    } else {
      return false;
    }
  }

  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }
}
