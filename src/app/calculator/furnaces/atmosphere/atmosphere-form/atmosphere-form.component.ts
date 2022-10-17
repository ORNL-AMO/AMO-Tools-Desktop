import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { AtmosphereLoss, AtmosphereLossOutput, AtmosphereLossResults } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { AtmosphereFormService, AtmosphereLossWarnings } from '../atmosphere-form.service';
import { AtmosphereService } from '../atmosphere.service';

@Component({
  selector: 'app-atmosphere-form',
  templateUrl: './atmosphere-form.component.html',
  styleUrls: ['./atmosphere-form.component.css']
})
export class AtmosphereFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  index: number;
  @Input()
  selected: boolean;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('specificHeatModal', { static: false }) public materialModal: ModalDirective;
  warnings: AtmosphereLossWarnings;

  materialTypes: Array<AtmosphereSpecificHeat>;
  showSpecificHeatModal: boolean = false;

  atmosphereLossForm: UntypedFormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;

  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: Subscription;

  lossResult: AtmosphereLossResults;
  isEditingName: boolean;

  trackingEnergySource: boolean;
  idString: string;
  outputSubscription: Subscription;

  constructor(private atmosphereFormService: AtmosphereFormService,
    private sqlDbApiService: SqlDbApiService,
    private convertUnitsService: ConvertUnitsService,
    private cd: ChangeDetectorRef,
    private atmosphereService: AtmosphereService) { }

  ngOnInit(): void {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.index;
    }
    else {
      this.idString = '_baseline_' + this.index;
    }
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    this.materialTypes = this.sqlDbApiService.selectAtmosphereSpecificHeat();
    this.initSubscriptions();
    this.energyUnit = this.atmosphereService.getAnnualEnergyUnit(this.atmosphereLossForm.controls.energySourceType.value, this.settings);
    if (this.isBaseline) {
      this.atmosphereService.energySourceType.next(this.atmosphereLossForm.controls.energySourceType.value);
    } else {
      let energySource = this.atmosphereService.energySourceType.getValue();
      this.setEnergySource(energySource);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      this.checkEnergySourceSub();
      let output: AtmosphereLossOutput = this.atmosphereService.output.getValue();
      this.setLossResult(output);
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSubscription.unsubscribe();
    if (this.trackingEnergySource) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  checkEnergySourceSub() {
    let isCurrentlySubscribed = this.trackingEnergySource;
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    if (!this.trackingEnergySource && isCurrentlySubscribed) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.atmosphereService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.atmosphereService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.atmosphereService.output.subscribe(output => {
      if (this.isBaseline) {
        this.lossResult = output.baseline.losses[this.index];
      } else {
        this.lossResult = output.modification.losses[this.index];
      }
    });
    if (this.trackingEnergySource) {
      this.energySourceTypeSub = this.atmosphereService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }

  }

  setLossResult(output: AtmosphereLossOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.atmosphereLossForm.disable();
    } else {
      this.materialTypes = this.sqlDbApiService.selectAtmosphereSpecificHeat();
      this.atmosphereLossForm.enable();
    }
  }

  setProperties() {
    let selectedMaterial: AtmosphereSpecificHeat = this.sqlDbApiService.selectAtmosphereSpecificHeatById(this.atmosphereLossForm.controls.atmosphereGas.value);
    if (selectedMaterial) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        selectedMaterial.specificHeat = this.convertUnitsService.value(selectedMaterial.specificHeat).from('btuScfF').to('kJm3C');
      }
      this.atmosphereLossForm.patchValue({
        specificHeat: this.roundVal(selectedMaterial.specificHeat, 4),
      });
    }
    this.calculate();
  }

  editLossName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  removeLoss() {
    this.atmosphereService.removeLoss(this.index);
  }

  checkSpecificHeat() {
    if (this.atmosphereLossForm.controls.atmosphereGas.value) {
      let material: AtmosphereSpecificHeat = this.sqlDbApiService.selectAtmosphereSpecificHeatById(this.atmosphereLossForm.controls.atmosphereGas.value);
      if (material) {
        let val = material.specificHeat;
        if (this.settings.unitsOfMeasure === 'Metric') {
          val = this.convertUnitsService.value(val).from('btuScfF').to('kJm3C');
        }
        material.specificHeat = this.roundVal(val, 4);
        if (material.specificHeat !== this.atmosphereLossForm.controls.specificHeat.value) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  setEnergySource(energySourceType: string) {
    this.atmosphereLossForm.patchValue({
      energySourceType: energySourceType
    });
    this.energyUnit = this.atmosphereService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (!this.trackingEnergySource) {
      this.atmosphereService.energySourceType.next(energySourceType);
    }
    this.cd.detectChanges();
    this.calculate();
  }


  initForm() {
    let updatedAtmosphereLossData: AtmosphereLoss;
    if (this.isBaseline) {
      let baselineData: Array<AtmosphereLoss> = this.atmosphereService.baselineData.getValue();
      updatedAtmosphereLossData = baselineData[this.index];
    } else {
      let modificationData: Array<AtmosphereLoss> = this.atmosphereService.modificationData.getValue();
      if (modificationData) {
        updatedAtmosphereLossData = modificationData[this.index];
      }
    }

    if (updatedAtmosphereLossData) {
      this.atmosphereLossForm = this.atmosphereFormService.getAtmosphereForm(updatedAtmosphereLossData, false);
    } else {
      this.atmosphereLossForm = this.atmosphereFormService.initForm();
    }

    this.calculate();
    this.setFormState();
  }

  focusField(str: string) {
    this.atmosphereService.currentField.next(str);
  }


  checkWarnings() {
    let tmpLoss: AtmosphereLoss = this.atmosphereFormService.getLossFromForm(this.atmosphereLossForm);
    this.warnings = this.atmosphereFormService.checkWarnings(tmpLoss);
  }

  calculate() {
    this.checkWarnings();
    let currentAtmosphereLoss: AtmosphereLoss = this.atmosphereFormService.getLossFromForm(this.atmosphereLossForm);
    this.atmosphereService.updateDataArray(currentAtmosphereLoss, this.index, this.isBaseline);

  }

  initSpecificHeatModal() {
    this.showSpecificHeatModal = true;
    this.atmosphereService.modalOpen.next(this.showSpecificHeatModal);
    this.materialModal.show();
  }

  hideSpecificHeatModal(event?: any) {
    if (event) {
      this.materialTypes = this.sqlDbApiService.selectAtmosphereSpecificHeat();
      let newMaterial: AtmosphereSpecificHeat = this.materialTypes.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.atmosphereLossForm.patchValue({
          atmosphereGas: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showSpecificHeatModal = false;
    this.atmosphereService.modalOpen.next(this.showSpecificHeatModal);
  }


  roundVal(val: number, digits: number) {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }


  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.atmosphereService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.atmosphereLossForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.atmosphereService.modalOpen.next(this.showFlueGasModal);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.atmosphereService.operatingHours = oppHours;
    this.atmosphereLossForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
