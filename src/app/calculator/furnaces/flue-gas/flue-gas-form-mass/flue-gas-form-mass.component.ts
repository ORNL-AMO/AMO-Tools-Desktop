import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { FlueGas, FlueGasByMass, FlueGasWarnings, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasFormService } from '../flue-gas-form.service';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-form-mass',
  templateUrl: './flue-gas-form-mass.component.html',
  styleUrls: ['./flue-gas-form-mass.component.css']
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

  resetDataSub: Subscription;
  byMassForm: FormGroup;
  options: Array<SolidLiquidFlueGasMaterial>;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  warnings: FlueGasWarnings;

  constructor(private flueGasService: FlueGasService,
    private flueGasFormService: FlueGasFormService,
    private phastService: PhastService,
    private cd: ChangeDetectorRef,
    private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      this.setFormState();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.flueGasService.resetData.subscribe(value => {
      this.initForm();
      this.cd.detectChanges();
    });
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
    let tmpFlueGas: SolidLiquidFlueGasMaterial = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.byMassForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
      this.byMassForm.patchValue({
        carbon: this.roundVal(tmpFlueGas.carbon, 4),
        hydrogen: this.roundVal(tmpFlueGas.hydrogen, 4),
        sulphur: this.roundVal(tmpFlueGas.sulphur, 4),
        inertAsh: this.roundVal(tmpFlueGas.inertAsh, 4),
        o2: this.roundVal(tmpFlueGas.o2, 4),
        moisture: this.roundVal(tmpFlueGas.moisture, 4),
        nitrogen: this.roundVal(tmpFlueGas.nitrogen, 4)
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

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  showMaterialModal() {
    this.flueGasService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.byMassForm.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.flueGasService.modalOpen.next(false);
    this.calculate();
  }


}
