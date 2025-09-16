import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { FlueGas, FlueGasByMass, FlueGasWarnings, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasFormService } from '../flue-gas-form.service';
import { FlueGasService } from '../flue-gas.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-flue-gas-form-mass',
  templateUrl: './flue-gas-form-mass.component.html',
  styleUrls: ['./flue-gas-form-mass.component.css'],
  standalone: false
})
export class FlueGasFormMassComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  inModal: boolean;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;

  resetDataSub: Subscription;
  byMassForm: UntypedFormGroup;
  options: Array<SolidLiquidFlueGasMaterial>;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen In Flue Gas'
  ];

  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  warnings: FlueGasWarnings;

  higherHeatingValue: number;
  showMoisture: boolean;
  materialsSub: Subscription;
  constructor(private flueGasService: FlueGasService,
    private flueGasFormService: FlueGasFormService,
    private convertUnitsService: ConvertUnitsService,
    private phastService: PhastService,
    private cd: ChangeDetectorRef,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService
  ) { }

  ngOnInit() {
    this.materialsSub = this.solidLiquidMaterialDbService.dbSolidLiquidFlueGasMaterials.subscribe(val => {
      this.options = val;
    });
    this.resetDataSub = this.flueGasService.resetData.subscribe(value => {
      this.initForm();
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }

  initFormSetup() {
    this.setFormState();
    if (this.byMassForm.controls.gasTypeId.value && this.byMassForm.controls.gasTypeId.value !== '') {
      if (this.byMassForm.controls.carbon.value === 0) {
        this.setProperties();
      }
    }
    this.setCalcMethod();
    this.calcExcessAir();
  }

  setFormState() {
    if (this.selected == false) {
      this.byMassForm.disable();
    } else {
      this.byMassForm.enable();
    }
  }

  initForm() {
    let updatedFlueGasData: FlueGas;
    if (this.isBaseline) {
      updatedFlueGasData = this.flueGasService.baselineData.getValue();
    } else {
      updatedFlueGasData = this.flueGasService.modificationData.getValue();
    }

    if (updatedFlueGasData && updatedFlueGasData.flueGasByMass) {
      this.byMassForm = this.flueGasFormService.initByMassFormFromLoss(updatedFlueGasData, false);
    } else {
      this.byMassForm = this.flueGasFormService.initEmptyMassForm(this.settings);
    }

    this.initFormSetup();
  }

  checkWarnings() {
    let tmpLoss: FlueGasByMass = this.flueGasFormService.buildByMassLossFromForm(this.byMassForm).flueGasByMass;
    this.warnings = this.flueGasFormService.checkFlueGasByMassWarnings(tmpLoss, this.settings);
  }

  setCalcMethod() {
    if (this.byMassForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
  }

  calcExcessAir() {
    let input: MaterialInputProperties = {
      carbon: this.byMassForm.controls.carbon.value,
      hydrogen: this.byMassForm.controls.hydrogen.value,
      sulphur: this.byMassForm.controls.sulphur.value,
      inertAsh: this.byMassForm.controls.inertAsh.value,
      o2: this.byMassForm.controls.o2.value,
      moisture: this.byMassForm.controls.moisture.value,
      nitrogen: this.byMassForm.controls.nitrogen.value,
      moistureInAirCombustion: this.byMassForm.controls.moistureInAirCombustion.value,
      o2InFlueGas: this.byMassForm.controls.o2InFlueGas.value,
      excessAir: this.byMassForm.controls.excessAirPercentage.value
    };

    if (!this.calcMethodExcessAir) {
      if (this.byMassForm.controls.o2InFlueGas.status === 'VALID') {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
        this.byMassForm.patchValue({
          excessAirPercentage: this.calculationExcessAir
        });
      } else {
        this.calculationExcessAir = 0;
        this.byMassForm.patchValue({
          excessAirPercentage: this.calculationExcessAir
        });
      }
    }

    if (this.calcMethodExcessAir) {
      if (this.byMassForm.controls.excessAirPercentage.status === 'VALID') {
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
        this.byMassForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2
        });
      } else {
        this.calculationFlueGasO2 = 0;
        this.byMassForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2
        });
      }
    }
    this.calculate();
  }

  calculate() {
    this.byMassForm = this.flueGasFormService.setValidators(this.byMassForm);
    let tmpFlueGas: SolidLiquidFlueGasMaterial = this.options.find(option => { return option.id === this.byMassForm.controls.gasTypeId.value });
    if (tmpFlueGas) {
      this.higherHeatingValue = this.phastService.flueGasByMassCalculateHeatingValue(tmpFlueGas);
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.higherHeatingValue = this.convertUnitsService.value(this.higherHeatingValue).from('btuLb').to('kJkg');
      }
    }
    this.checkWarnings();
    let currentDataByMass: FlueGas = this.flueGasFormService.buildByMassLossFromForm(this.byMassForm)
    if (this.isBaseline) {
      this.flueGasService.baselineData.next(currentDataByMass);
    } else {
      this.flueGasService.modificationData.next(currentDataByMass);
    }
  }

  focusField(str: string) {
    if (str === 'gasTypeId' && this.inModal) {
      str = 'gasTypeIdModal'
    }
    this.flueGasService.currentField.next(str);
  }

  setProperties() {
    let tmpFlueGas: SolidLiquidFlueGasMaterial = this.options.find(option => { return option.id === this.byMassForm.controls.gasTypeId.value });
    if (tmpFlueGas) {
      this.byMassForm.patchValue({
        carbon: roundVal(tmpFlueGas.carbon, 4),
        hydrogen: roundVal(tmpFlueGas.hydrogen, 4),
        sulphur: roundVal(tmpFlueGas.sulphur, 4),
        inertAsh: roundVal(tmpFlueGas.inertAsh, 4),
        o2: roundVal(tmpFlueGas.o2, 4),
        moisture: roundVal(tmpFlueGas.moisture, 4),
        nitrogen: roundVal(tmpFlueGas.nitrogen, 4)
      });
    }
    this.calculate();
  }

  changeMethod() {
    this.byMassForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  showMoistureModal() {
    this.flueGasService.modalOpen.next(true);
    this.showMoisture = true;
    this.moistureModal.show();
  }

  hideMoistureModal(moistureInAirCombustion?: number) {
    if (moistureInAirCombustion) {
      moistureInAirCombustion = Number(moistureInAirCombustion.toFixed(2));
      this.byMassForm.controls.moistureInAirCombustion.patchValue(moistureInAirCombustion);
    }
    this.moistureModal.hide();
    this.showMoisture = false;
    this.flueGasService.modalOpen.next(false);
    this.calculate();
  }


  showMaterialModal() {
    this.flueGasService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      let newMaterial: SolidLiquidFlueGasMaterial = this.options.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.byMassForm.patchValue({
          gasTypeId: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.flueGasService.modalOpen.next(false);
    this.calculate();
  }


}
