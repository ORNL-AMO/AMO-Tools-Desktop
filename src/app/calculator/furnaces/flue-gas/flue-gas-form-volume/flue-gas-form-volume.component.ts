import { Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { FlueGas, FlueGasByVolume, FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { FlueGasFormService } from '../flue-gas-form.service';
import { FlueGasService } from '../flue-gas.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-flue-gas-form-volume',
  templateUrl: './flue-gas-form-volume.component.html',
  styleUrls: ['./flue-gas-form-volume.component.css'],
  standalone: false
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
  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  byVolumeForm: UntypedFormGroup;

  options: Array<FlueGasMaterial> = [];
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen In Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  warnings: FlueGasWarnings;
  baselineDataSub: Subscription;

  higherHeatingValue: number;
  showMoisture: boolean;
  materialsSub: Subscription;
  constructor(private flueGasService: FlueGasService,
    private convertUnitsService: ConvertUnitsService,
    private flueGasFormService: FlueGasFormService,
    private flueGasMaterialDbService: FlueGasMaterialDbService) {
  }

  ngOnInit() {
    this.materialsSub = this.flueGasMaterialDbService.dbFlueGasMaterials.subscribe(val => {
      this.options = val;
    });
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    if (!this.isBaseline) {
      this.baselineDataSub.unsubscribe();
    }
    this.materialsSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
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
          this.byVolumeForm.patchValue({ gasTypeId: baselineData.flueGasByVolume.gasTypeId });
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
      this.byVolumeForm = this.flueGasFormService.initEmptyVolumeForm(this.settings);
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
    if (!this.calcMethodExcessAir) {
      this.byVolumeForm.patchValue({
        excessAirPercentage: 0
      });
    }

    if (this.calcMethodExcessAir) {
      this.byVolumeForm.patchValue({
        o2InFlueGas: 0
      });
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
    let tmpFlueGas: FlueGasMaterial = this.options.find(material => material.id === currentDataByVolume.flueGasByVolume.gasTypeId);
    if (tmpFlueGas) {
      let heatingValue: number = tmpFlueGas.heatingValue;
      if (this.settings.unitsOfMeasure === 'Metric') {
        heatingValue = this.convertUnitsService.value(heatingValue).from('btuLb').to('kJkg');
      }
      this.higherHeatingValue = heatingValue;
    }

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
        this.byVolumeForm.patchValue({ gasTypeId: currentMaterial });
      } else if (treasureHuntEnergySource === 'Other Fuel') {
        currentMaterial = 2;
        this.byVolumeForm.patchValue({ gasTypeId: currentMaterial });
      }
    }
    let tmpFlueGas: FlueGasMaterial = this.options.find(material => material.id === currentMaterial);
    if (tmpFlueGas) {
      this.byVolumeForm.patchValue({
        CH4: roundVal(tmpFlueGas.CH4, 4),
        C2H6: roundVal(tmpFlueGas.C2H6, 4),
        N2: roundVal(tmpFlueGas.N2, 4),
        H2: roundVal(tmpFlueGas.H2, 4),
        C3H8: roundVal(tmpFlueGas.C3H8, 4),
        C4H10_CnH2n: roundVal(tmpFlueGas.C4H10_CnH2n, 4),
        H2O: roundVal(tmpFlueGas.H2O, 4),
        CO: roundVal(tmpFlueGas.CO, 4),
        CO2: roundVal(tmpFlueGas.CO2, 4),
        SO2: roundVal(tmpFlueGas.SO2, 4),
        O2: roundVal(tmpFlueGas.O2, 4)
      });
    }
    this.calculate();
  }

  showMaterialModal() {
    this.flueGasService.modalOpen.next(true);
    this.materialModal.show();
  }

  showMoistureModal() {
    this.flueGasService.modalOpen.next(true);
    this.showMoisture = true;
    this.moistureModal.show();
  }

  hideMoistureModal(moistureInAirCombustion?: number) {
    if (moistureInAirCombustion) {
      moistureInAirCombustion = Number(moistureInAirCombustion.toFixed(2));
      this.byVolumeForm.controls.moistureInAirCombustion.patchValue(moistureInAirCombustion);
    }
    this.moistureModal.hide();
    this.showMoisture = false;
    this.flueGasService.modalOpen.next(false);
    this.calculate();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      let newMaterial: FlueGasMaterial = this.options.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.byVolumeForm.patchValue({
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