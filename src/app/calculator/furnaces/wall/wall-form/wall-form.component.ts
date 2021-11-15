import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { WallLoss, WallLossOutput, WallLossResult } from '../../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { treasureHuntUtilityOptions } from '../../furnace-defaults';
import { WallFormService } from '../wall-form.service';
import { WallService } from '../wall.service';

@Component({
  selector: 'app-wall-form',
  templateUrl: './wall-form.component.html',
  styleUrls: ['./wall-form.component.css']
})
export class WallFormComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  index: number;
  @Input()
  selected: boolean;

  @ViewChild('surfaceModal', { static: false }) public surfaceModal: ModalDirective;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  
  surfaceOptions: Array<WallLossesSurface>;
  treasureHuntUtilityOptions: Array<string>;
  showSurfaceModal: boolean = false;
  
  wallLossesForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;
  defaultFlueGasModalEnergySource: string;
  
  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: Subscription;
  outputSubscription: Subscription;
  lossResult: WallLossResult;
  treasureHuntFuelCostSub: Subscription;
  isEditingName: boolean;

  idString: string;

  constructor(private wallFormService: WallFormService,
    private sqlDbApiService: SqlDbApiService,
    private cd: ChangeDetectorRef,
    private wallService: WallService) { }

  ngOnInit(): void {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.index;
    }
    else {
      this.idString = '_baseline_' + this.index;
    }
    if (this.inTreasureHunt) {
      this.treasureHuntUtilityOptions = treasureHuntUtilityOptions;
    }
    this.initSubscriptions();
    this.energyUnit = this.wallService.getAnnualEnergyUnit(this.wallLossesForm.controls.energySourceType.value, this.settings);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      this.setFormState();
      let output: WallLossOutput = this.wallService.output.getValue();
      this.setLossResult(output);
    }
  }

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSubscription.unsubscribe();
    if ((this.isBaseline && this.index > 0) || (!this.isBaseline)) {
      this.energySourceTypeSub.unsubscribe();
      if (this.inTreasureHunt) {
        this.treasureHuntFuelCostSub.unsubscribe();
      }
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.wallService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.wallService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.wallService.output.subscribe(output => {
      this.setLossResult(output);
    });
    if ((this.isBaseline && this.index > 0) || !this.isBaseline) {
      this.energySourceTypeSub = this.wallService.energySourceType.subscribe(energySourceType => {
        if (energySourceType) {
          this.wallLossesForm.patchValue({ energySourceType: energySourceType });
          this.cd.detectChanges();
          this.calculate();
        }
      });

      if (this.inTreasureHunt) {
        this.treasureHuntFuelCostSub = this.wallService.treasureHuntFuelCost.subscribe(treasureHuntFuelCost => {
          if (treasureHuntFuelCost) {
            this.wallLossesForm.patchValue({ fuelCost: treasureHuntFuelCost });
            this.cd.detectChanges();
            this.calculate();
          }
        });
      }
    }
  }

  setLossResult(output: WallLossOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.wallLossesForm.disable();
    } else {
      this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
      this.wallLossesForm.enable();
    }

    if (this.inTreasureHunt && !this.isBaseline) {
      this.wallLossesForm.controls.energySourceType.disable();
    }
  }

  setEnergySourceFromToggle(energySourceType: string) {
    this.wallLossesForm.patchValue({
      energySourceType: energySourceType
    });
    this.setEnergyData();
  }

  setEnergyData() {
    let energySourceType = this.wallLossesForm.controls.energySourceType.value;
    this.energyUnit = this.wallService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (this.inTreasureHunt) {
      let treasureHuntFuelCost = this.wallService.getTreasureHuntFuelCost(energySourceType, this.settings);
      this.wallLossesForm.patchValue({fuelCost: treasureHuntFuelCost});
      this.wallService.treasureHuntFuelCost.next(treasureHuntFuelCost);
    }
    this.wallService.energySourceType.next(energySourceType);

    this.cd.detectChanges();
    this.defaultFlueGasModalEnergySource = this.wallLossesForm.value.energySourceType;
    this.calculate();
  }

  editLossName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  initForm() {
    let updatedWallLossData: WallLoss;
    if (this.isBaseline) {
      let baselineData: Array<WallLoss> = this.wallService.baselineData.getValue();
      updatedWallLossData = baselineData[this.index];
    } else {
      let modificationData: Array<WallLoss> = this.wallService.modificationData.getValue();
      if (modificationData) {
        updatedWallLossData = modificationData[this.index];
      }
    }
    if (updatedWallLossData) {
      this.wallLossesForm = this.wallFormService.getWallLossForm(updatedWallLossData, false);
    } else {
      this.wallLossesForm = this.wallFormService.initForm();
    }

    this.defaultFlueGasModalEnergySource = this.wallLossesForm.value.energySourceType;
    this.surfaceOptions = this.sqlDbApiService.selectWallLossesSurface();
    this.calculate();
    this.setFormState();
  }

  disableForm() {
    this.wallLossesForm.controls.surfaceShape.disable();
  }
  enableForm() {
    this.wallLossesForm.controls.surfaceShape.enable();
  }

  focusField(str: string) {
    this.wallService.currentField.next(str);
  }

  calculate() {
    this.wallLossesForm = this.wallFormService.setValidators(this.wallLossesForm);
    let currentWallLoss: WallLoss = this.wallFormService.getWallLossFromForm(this.wallLossesForm);
    this.wallService.updateDataArray(currentWallLoss, this.index, this.isBaseline);
  }

  removeLoss() {
    this.wallService.removeLoss(this.index);
  }

  setProperties() {
    let tmpFactor: WallLossesSurface = this.sqlDbApiService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    if (tmpFactor) {
      this.wallLossesForm.patchValue({
        conditionFactor: this.roundVal(tmpFactor.conditionFactor, 4)
      });
    }
    this.calculate();
  }

  roundVal(val: number, digits: number) {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

  showSurfaceShapeModal() {
    this.showSurfaceModal = true;
    this.wallService.modalOpen.next(this.showSurfaceModal);
    this.surfaceModal.show();
  }

  hideSurfaceShapeModal(event?: any) {
    if (event) {
      this.surfaceOptions = this.sqlDbApiService.selectWallLossesSurface();
      let newMaterial: WallLossesSurface = this.surfaceOptions.find(material => { return material.surface === event.surface; });
      if (newMaterial) {
        this.wallLossesForm.patchValue({
          surfaceShape: newMaterial.id
        });
        this.setProperties();
      }
    }
    this.surfaceModal.hide();
    this.showSurfaceModal = false;
    this.wallService.modalOpen.next(this.showSurfaceModal);
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.wallService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.wallLossesForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.wallService.modalOpen.next(this.showFlueGasModal);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.wallService.operatingHours = oppHours;
    this.wallLossesForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
