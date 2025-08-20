import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData, HeatCascadingInput, HeatCascadingOutput } from '../../../../shared/models/phast/heatCascading';
import { FlueGasHeatingValue } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { HeatCascadingFormService } from '../heat-cascading-form.service';
import { HeatCascadingService } from '../heat-cascading.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-heat-cascading-form',
  templateUrl: './heat-cascading-form.component.html',
  styleUrls: ['./heat-cascading-form.component.css'],
  standalone: false
})
export class HeatCascadingFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('gasMaterialModal', { static: false }) public gasMaterialModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: UntypedFormGroup;
  fuelOptions: Array<FlueGasMaterial>;
  fuelOptionsSub: Subscription;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  selectedFuelId: number;

  formWidth: number;

  showPriOpHoursModal: boolean = false;
  showSecOpHoursModal: boolean = false;
  showFlueGasModal: boolean = false;

  outputSubscription: Subscription;
  output: HeatCascadingOutput;

  constructor(
    private heatCascadingService: HeatCascadingService,
    private phastService: PhastService,
    private heatCascadingFormService: HeatCascadingFormService,
    private flueGasMaterialDbService: FlueGasMaterialDbService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.fuelOptionsSub = this.flueGasMaterialDbService.dbFlueGasMaterials.subscribe(val => {
      this.fuelOptions = val;
    });
    this.resetDataSub = this.heatCascadingService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.heatCascadingService.generateExample.subscribe(value => {
      this.initForm();
    });

    this.outputSubscription = this.heatCascadingService.heatCascadingOutput.subscribe(val => {
      this.output = val;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSubscription.unsubscribe();
    this.fuelOptionsSub.unsubscribe();
  }

  initForm() {
    let heatCascadingInput: HeatCascadingInput = this.heatCascadingService.heatCascadingInput.getValue();
    this.form = this.heatCascadingFormService.getHeatCascadingForm(heatCascadingInput);
    if (this.form.controls.materialTypeId.value && this.form.controls.materialTypeId.value !== '') {
      if (this.form.controls.CH4.value === '' || !this.form.controls.CH4.value) {
        this.setMaterialProperties();
      }
    }
  }

  setMaterialProperties() {
    let material: FlueGasMaterial = this.fuelOptions.find(option => { option.id === this.form.controls.materialTypeId.value });
    if (material) {
      this.selectedFuelId = this.form.controls.materialTypeId.value;
      let flueGasMaterialHeatingValue: FlueGasHeatingValue = this.phastService.flueGasByVolumeCalculateHeatingValue(material);
      this.form.controls.fuelHV.patchValue(roundVal(flueGasMaterialHeatingValue.heatingValueVolume, 2));
      this.form.patchValue({
        CH4: roundVal(material.CH4, 4),
        C2H6: roundVal(material.C2H6, 4),
        N2: roundVal(material.N2, 4),
        H2: roundVal(material.H2, 4),
        C3H8: roundVal(material.C3H8, 4),
        C4H10_CnH2n: roundVal(material.C4H10_CnH2n, 4),
        H2O: roundVal(material.H2O, 4),
        CO: roundVal(material.CO, 4),
        CO2: roundVal(material.CO2, 4),
        SO2: roundVal(material.SO2, 4),
        O2: roundVal(material.O2, 4),
        substance: material.substance
      });
      this.calculate();
    }
  }

  focusField(str: string) {
    if (str === 'materialTypeId' && this.inModal) {
      str = 'materialTypeIdModal';
    }
    this.heatCascadingService.currentField.next(str);
  }

  calculate() {
    let updatedInput: HeatCascadingInput = this.heatCascadingFormService.getHeatCascadingInput(this.form);
    this.heatCascadingService.heatCascadingInput.next(updatedInput)
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.selectedFuelId = this.form.controls.materialTypeId.value;
    this.heatCascadingService.modalOpen.next(true);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.form.patchValue({
        secAvailableHeat: flueGasModalData.calculatedAvailableHeat,
        fuelTempF: flueGasModalData.fuelTempF,
        ambientAirTempF: flueGasModalData.ambientAirTempF,
        combAirMoisturePerc: flueGasModalData.combAirMoisturePerc,
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.heatCascadingService.modalOpen.next(false);
  }

  closeOperatingHoursModal() {
    this.showPriOpHoursModal = false;
    this.showSecOpHoursModal = false;
  }

  openOpHoursModal(processName: string) {
    if (processName == 'primary') {
      this.showPriOpHoursModal = true;
    } else {
      this.showSecOpHoursModal = true;
    }
  }

  updateOperatingHours(oppHours: OperatingHours) {
    if (this.showPriOpHoursModal) {
      this.form.controls.priOpHours.patchValue(oppHours.hoursPerYear);
    } else if (this.showSecOpHoursModal) {
      this.form.controls.secOpHours.patchValue(oppHours.hoursPerYear);
    }
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  showMaterialModal() {
    this.heatCascadingService.modalOpen.next(true);
    this.gasMaterialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      let newMaterial: FlueGasMaterial | SolidLiquidFlueGasMaterial = this.fuelOptions.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.form.patchValue({
          materialTypeId: newMaterial.id,
          substance: newMaterial.substance
        });
        this.setMaterialProperties();
      }
    }
    this.gasMaterialModal.hide();
    this.heatCascadingService.modalOpen.next(false);
    this.calculate();
  }
}

