import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { EnergyData } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ChargeMaterialService } from '../charge-material.service';
import { EnergyFormService } from './energy-form.service';

@Component({
    selector: 'app-energy-form',
    templateUrl: './energy-form.component.html',
    styleUrls: ['./energy-form.component.css'],
    standalone: false
})
export class EnergyFormComponent implements OnInit {
  showOperatingHoursModal: boolean;
  energyForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  operatingHours: OperatingHours;
  
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;

  formWidth: number;
  energyUnit: string;
  energySourceTypeSub: any;
  idString: string;
  index: number = 0;
  
  constructor(private chargeMaterialService: ChargeMaterialService,
             private cd: ChangeDetectorRef,
             private energyFormService: EnergyFormService) { }

  ngOnInit(): void {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.initSubscriptions();
    this.energyUnit = this.chargeMaterialService.getAnnualEnergyUnit(this.energyForm.controls.energySourceType.value, this.settings);
    if (this.isBaseline) {
      this.chargeMaterialService.energySourceType.next(this.energyForm.controls.energySourceType.value);
    } else {
      let energySource = this.chargeMaterialService.energySourceType.getValue();
      this.setEnergySource(energySource);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }
  
  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    if (!this.isBaseline) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.chargeMaterialService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.chargeMaterialService.generateExample.subscribe(value => {
      this.initForm();
    });
    if (!this.isBaseline) {
      this.energySourceTypeSub = this.chargeMaterialService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }
  }

  setEnergySource(energySourceType: string) {
    this.energyForm.patchValue({
      energySourceType: energySourceType
    });
    this.energyUnit = this.chargeMaterialService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (this.isBaseline) {
      this.chargeMaterialService.energySourceType.next(energySourceType);
    }
    this.cd.detectChanges();
    this.calculate();
  }

  setFormState() {
    if (this.selected == false) {
      this.energyForm.disable();
    } else {
      this.energyForm.enable();
    }
  }


  initForm() {
    let energyData: EnergyData;
    if (this.isBaseline) {
      energyData = this.chargeMaterialService.baselineEnergyData.getValue();
    } else {
      energyData = this.chargeMaterialService.modificationEnergyData.getValue();
    }
    if (energyData) {
      this.energyForm = this.energyFormService.getEnergyForm(energyData);
    } else {
      this.energyForm = this.energyFormService.initEnergyForm();
    }

    this.calculate();
    this.setFormState();
  }


  focusField(str: string) {
    this.chargeMaterialService.currentField.next(str);
  }

  calculate() {
    let currentEnergyData: EnergyData = this.energyFormService.buildEnergyData(this.energyForm);
    if (this.isBaseline) {
      this.chargeMaterialService.baselineEnergyData.next(currentEnergyData);
    } else {
      this.chargeMaterialService.modificationEnergyData.next(currentEnergyData);
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.chargeMaterialService.operatingHours = oppHours;
    this.energyForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.chargeMaterialService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.energyForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.chargeMaterialService.modalOpen.next(this.showFlueGasModal);
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
}
