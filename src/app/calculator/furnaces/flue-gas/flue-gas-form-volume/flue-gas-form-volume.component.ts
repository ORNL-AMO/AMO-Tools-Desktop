import { Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { FlueGas, FlueGasByVolume, FlueGasWarnings, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasFormService } from '../flue-gas-form.service';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-form-volume',
  templateUrl: './flue-gas-form-volume.component.html',
  styleUrls: ['./flue-gas-form-volume.component.css']
})
export class FlueGasFormVolumeComponent implements OnInit, OnDestroy {
  @Input()
  inTreasureHunt: boolean;
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  inModal: boolean;
  @Input()
  treasureHuntEnergySource: string;
  @Input()
  selectedFuelId: number;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  byVolumeForm: FormGroup;

  options: Array<FlueGasMaterial>;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  warnings: FlueGasWarnings;
  baselineDataSub: Subscription;

  constructor(private flueGasService: FlueGasService,
    private flueGasFormService: FlueGasFormService,
    private phastService: PhastService,
    private suiteDbService: SuiteDbService) {
  }

  ngOnInit() {
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    if (!this.isBaseline) {
      this.baselineDataSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
      this.setFormState();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.flueGasService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.flueGasService.generateExample.subscribe(value => {
      this.initForm();
    })
    if (!this.isBaseline) {
      this.baselineDataSub = this.flueGasService.baselineData.subscribe(baselineData => {
        if (baselineData && baselineData.flueGasByVolume) {
          this.byVolumeForm.patchValue({gasTypeId: baselineData.flueGasByVolume.gasTypeId});
          this.calculate();
        }
      })
    }
  }

  initFormSetup() {
    this.setFormState();
    if (this.selectedFuelId !== undefined) {
      this.byVolumeForm.controls.gasTypeId.patchValue(this.selectedFuelId);
      this.byVolumeForm.controls.gasTypeId.disable();
    }
    if (this.byVolumeForm.controls.gasTypeId.value && this.byVolumeForm.controls.gasTypeId.value !== '') {
      if (this.byVolumeForm.controls.CH4.value === '' || !this.byVolumeForm.controls.CH4.value) {
        this.setProperties(this.treasureHuntEnergySource);
      }
    }
    this.setCalcMethod();
    this.calcExcessAir();
  }

  initForm() {
    let updatedFlueGasData: FlueGas;
    if (this.isBaseline) {
      updatedFlueGasData = this.flueGasService.baselineData.getValue();
    } else {
      updatedFlueGasData = this.flueGasService.modificationData.getValue();
    }

    if (updatedFlueGasData && updatedFlueGasData.flueGasByVolume) {
      this.byVolumeForm = this.flueGasFormService.initByVolumeFormFromLoss(updatedFlueGasData, false);
    } else {
      this.byVolumeForm = this.flueGasFormService.initEmptyVolumeForm();
    }
    this.initFormSetup();
  }

  setFormState() {
    if (this.selected == false) {
      this.byVolumeForm.disable();
    } else {
      this.byVolumeForm.enable();
    }
    if (this.inTreasureHunt && !this.isBaseline) {
      this.byVolumeForm.controls.gasTypeId.disable();
    }
  }

  setCalcMethod() {
    if (this.byVolumeForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
  }

  calcExcessAir() {
    let input: MaterialInputProperties = {
      CH4: this.byVolumeForm.controls.CH4.value,
      C2H6: this.byVolumeForm.controls.C2H6.value,
      N2: this.byVolumeForm.controls.N2.value,
      H2: this.byVolumeForm.controls.H2.value,
      C3H8: this.byVolumeForm.controls.C3H8.value,
      C4H10_CnH2n: this.byVolumeForm.controls.C4H10_CnH2n.value,
      H2O: this.byVolumeForm.controls.H2O.value,
      CO: this.byVolumeForm.controls.CO.value,
      CO2: this.byVolumeForm.controls.CO2.value,
      SO2: this.byVolumeForm.controls.SO2.value,
      O2: this.byVolumeForm.controls.O2.value,
      o2InFlueGas: this.byVolumeForm.controls.o2InFlueGas.value,
      excessAir: this.byVolumeForm.controls.excessAirPercentage.value
    };

    if (!this.calcMethodExcessAir) {
      if (this.byVolumeForm.controls.o2InFlueGas.status !== 'INVALID') {
        this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
        this.byVolumeForm.patchValue({
          excessAirPercentage: this.calculationExcessAir,
        });
      } else {
        this.calculationExcessAir = 0;
        this.byVolumeForm.patchValue({
          excessAirPercentage: this.calculationExcessAir,
        });
      }
    }

    if (this.calcMethodExcessAir) {
      if (this.byVolumeForm.controls.excessAirPercentage.status !== 'INVALID') {
        this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
        this.byVolumeForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2,
        });
      } else {
        this.calculationFlueGasO2 = 0;
        this.byVolumeForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2,
        });
      }
    }
    this.calculate();
  }

  checkWarnings() {
    let tmpLoss: FlueGasByVolume = this.flueGasFormService.buildByVolumeLossFromForm(this.byVolumeForm).flueGasByVolume;
    this.warnings = this.flueGasFormService.checkFlueGasByVolumeWarnings(tmpLoss, this.settings);
  }

  calculate() {
    this.byVolumeForm = this.flueGasFormService.setValidators(this.byVolumeForm);
    this.checkWarnings();
    let currentDataByVolume: FlueGas = this.flueGasFormService.buildByVolumeLossFromForm(this.byVolumeForm)
    if (this.isBaseline) {
      this.flueGasService.baselineData.next(currentDataByVolume);
    } else {
      this.flueGasService.modificationData.next(currentDataByVolume);
    }
  }

  focusField(str: string) {
    if (str === 'gasTypeId' && this.inModal) {
      str = 'gasTypeIdModal'
    }
    this.flueGasService.currentField.next(str);
  }

  setFuelTemp() {
    this.byVolumeForm.patchValue({
      fuelTemperature: this.byVolumeForm.controls.combustionAirTemperature.value
    });
    this.calculate();
  }

  changeMethod() {
    this.byVolumeForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  setProperties(treasureHuntEnergySource?: string) {
    let currentMaterial: number = this.byVolumeForm.controls.gasTypeId.value;
    if (treasureHuntEnergySource) {
      if (treasureHuntEnergySource === 'Natural Gas' || treasureHuntEnergySource === 'Steam') {
        currentMaterial = 1;
        this.byVolumeForm.patchValue({gasTypeId: currentMaterial});
      } else if (treasureHuntEnergySource === 'Other Fuel') {
        currentMaterial = 2;
        this.byVolumeForm.patchValue({gasTypeId: currentMaterial});
      }
    } 
    let tmpFlueGas: FlueGasMaterial = this.suiteDbService.selectGasFlueGasMaterialById(currentMaterial);
    if (tmpFlueGas) {
      this.byVolumeForm.patchValue({
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
    this.calculate();
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
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.byVolumeForm.patchValue({
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