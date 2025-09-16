import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { FixtureLoss, FixtureLossOutput, FixtureLossResults } from '../../../../shared/models/phast/losses/fixtureLoss';
import { Settings } from '../../../../shared/models/settings';
import { FixtureFormService } from '../fixture-form.service';
import { FixtureService } from '../fixture.service';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-fixture-form',
  templateUrl: './fixture-form.component.html',
  styleUrls: ['./fixture-form.component.css'],
  standalone: false
})
export class FixtureFormComponent implements OnInit {
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
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  materialTypes: Array<SolidLoadChargeMaterial>;
  showMaterialModal: boolean = false;

  fixtureForm: UntypedFormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;

  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: Subscription;

  lossResult: FixtureLossResults;
  isEditingName: boolean;

  trackingEnergySource: boolean;
  idString: string;
  outputSubscription: Subscription;

  constructor(private fixtureFormService: FixtureFormService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private convertUnitsService: ConvertUnitsService,
    private cd: ChangeDetectorRef,
    private fixtureService: FixtureService) { }

  ngOnInit(): void {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.index;
    }
    else {
      this.idString = '_baseline_' + this.index;
    }
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    this.setMaterials();
    this.initSubscriptions();
    this.energyUnit = this.fixtureService.getAnnualEnergyUnit(this.fixtureForm.controls.energySourceType.value, this.settings);
    if (this.isBaseline) {
      this.fixtureService.energySourceType.next(this.fixtureForm.controls.energySourceType.value);
    } else {
      let energySource = this.fixtureService.energySourceType.getValue();
      this.setEnergySource(energySource);
    }
    this.setProperties();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      this.checkEnergySourceSub();
      let output: FixtureLossOutput = this.fixtureService.output.getValue();
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

  async setMaterials() {
    this.materialTypes = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable())
  }

  checkEnergySourceSub() {
    let isCurrentlySubscribed = this.trackingEnergySource;
    this.trackingEnergySource = this.index > 0 || !this.isBaseline;

    if (!this.trackingEnergySource && isCurrentlySubscribed) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.fixtureService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.fixtureService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.fixtureService.output.subscribe(output => {
      if (this.isBaseline) {
        this.lossResult = output.baseline.losses[this.index];
      } else {
        this.lossResult = output.modification.losses[this.index];
      }
    });
    if (this.trackingEnergySource) {
      this.energySourceTypeSub = this.fixtureService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }

  }

  setLossResult(output: FixtureLossOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  async setFormState() {
    if (this.selected == false) {
      this.fixtureForm.disable();
    } else {
      this.setMaterials();
      this.fixtureForm.enable();
    }
  }

  setProperties() {
    let selectedMaterial: SolidLoadChargeMaterial = this.materialTypes.find(material => { return material.id === this.fixtureForm.controls.materialName.value; });
    if (selectedMaterial) {
      let specificHeatSolid: number = selectedMaterial.specificHeatSolid;
      if (this.settings.unitsOfMeasure === 'Metric') {
        specificHeatSolid = this.convertUnitsService.value(specificHeatSolid).from('btulbF').to('kJkgC');
      }

      this.fixtureForm.patchValue({
        specificHeat: roundVal(specificHeatSolid, 4)
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
    this.fixtureService.removeLoss(this.index);
  }


  setEnergySource(energySourceType: string) {
    this.fixtureForm.patchValue({
      energySourceType: energySourceType
    });
    this.energyUnit = this.fixtureService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (!this.trackingEnergySource) {
      this.fixtureService.energySourceType.next(energySourceType);
    }
    this.cd.detectChanges();
    this.calculate();
  }


  initForm() {
    let updatedFixtureLossData: FixtureLoss;
    if (this.isBaseline) {
      let baselineData: Array<FixtureLoss> = this.fixtureService.baselineData.getValue();
      updatedFixtureLossData = baselineData[this.index];
    } else {
      let modificationData: Array<FixtureLoss> = this.fixtureService.modificationData.getValue();
      if (modificationData) {
        updatedFixtureLossData = modificationData[this.index];
      }
    }

    if (updatedFixtureLossData) {
      this.fixtureForm = this.fixtureFormService.getFormFromLoss(updatedFixtureLossData, false);
    } else {
      this.fixtureForm = this.fixtureFormService.initForm();
    }

    this.calculate();
    this.setFormState();
  }

  focusField(str: string) {
    this.fixtureService.currentField.next(str);
  }

  calculate() {
    let currentFixtureLoss: FixtureLoss = this.fixtureFormService.getLossFromForm(this.fixtureForm);
    this.fixtureService.updateDataArray(currentFixtureLoss, this.index, this.isBaseline);

  }

  initMaterialModal() {
    this.showMaterialModal = true;
    this.fixtureService.modalOpen.next(this.showMaterialModal);
    this.materialModal.show();
  }

  async hideMaterialModal(event?: any) {
    if (event) {
      await this.setMaterials();
      let newMaterial: SolidLoadChargeMaterial = this.materialTypes.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.fixtureForm.patchValue({
          materialName: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showMaterialModal = false;
    this.fixtureService.modalOpen.next(this.showMaterialModal);
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.fixtureService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.fixtureForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.fixtureService.modalOpen.next(this.showFlueGasModal);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.fixtureService.operatingHours = oppHours;
    this.fixtureForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
