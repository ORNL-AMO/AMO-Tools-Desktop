import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WallFormService } from '../wall-form.service';
import { WallService } from '../wall.service';

@Component({
  selector: 'app-wall-form',
  templateUrl: './wall-form.component.html',
  styleUrls: ['./wall-form.component.css']
})
export class WallFormComponent implements OnInit {
  
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  inModal: boolean;
  @Input()
  selected: boolean;
  @ViewChild('surfaceModal', { static: false }) public surfaceModal: ModalDirective;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;

  
  surfaceOptions: Array<WallLossesSurface>;
  showSurfaceModal: boolean = false;

  wallLossesForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;

  showOperatingHoursModal: boolean;
  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: any;

  constructor(private wallFormService: WallFormService,
              private suiteDbService: SuiteDbService,
              private cd: ChangeDetectorRef,
              private wallService: WallService) { }
  ngOnInit(): void {
    this.initSubscriptions();
    this.energyUnit = this.wallService.getAnnualEnergyUnit(this.wallLossesForm.controls.energySourceType.value, this.settings);
    if (this.isBaseline) {
      this.wallService.energySourceType.next(this.wallLossesForm.controls.energySourceType.value);
    } else {
      let energySource = this.wallService.energySourceType.getValue();
      this.setEnergySource(energySource);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }

  
  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    if (!this.isBaseline) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.wallService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.wallService.generateExample.subscribe(value => {
      this.initForm();
    });
    if (!this.isBaseline) {
      this.energySourceTypeSub = this.wallService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.wallLossesForm.disable();
    } else {
      this.wallLossesForm.enable();
    }
  }

  setEnergySource(energySourceType: string) {
    this.wallLossesForm.patchValue({
      energySourceType: energySourceType
    });
    this.energyUnit = this.wallService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (this.isBaseline) {
      this.wallService.energySourceType.next(energySourceType);
    }
    this.cd.detectChanges();
    this.calculate();
  }


  initForm() {
    let updatedWallLossData: WallLoss;
    if (this.isBaseline) {
      updatedWallLossData = this.wallService.baselineData.getValue();
    } else {
      updatedWallLossData = this.wallService.modificationData.getValue();
    }
    if (updatedWallLossData) {
      this.wallLossesForm = this.wallFormService.getWallLossForm(updatedWallLossData);
    } else {
      this.wallLossesForm = this.wallFormService.initForm();
    }

    this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
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
    if (this.isBaseline) {
      this.wallService.baselineData.next(currentWallLoss);
    } else {
      this.wallService.modificationData.next(currentWallLoss);
    }
  }

  setProperties() {
    let tmpFactor = this.suiteDbService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    this.wallLossesForm.patchValue({
      conditionFactor: this.roundVal(tmpFactor.conditionFactor, 4)
    });
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
      this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
      let newMaterial = this.surfaceOptions.filter(material => { return material.surface === event.surface; });
      if (newMaterial.length !== 0) {
        this.wallLossesForm.patchValue({
          surfaceShape: newMaterial[0].id
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

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.roundVal(calculatedAvailableHeat, 1);
      this.wallLossesForm.patchValue({
        availableHeat: calculatedAvailableHeat
      });
    }
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
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
