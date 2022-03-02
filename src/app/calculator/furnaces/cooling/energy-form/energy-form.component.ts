import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { EnergyData } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { EnergyFormService } from '../../charge-material/energy-form/energy-form.service';
import { CoolingService } from '../cooling.service';

@Component({
  selector: 'app-cooling-energy-form',
  templateUrl: './energy-form.component.html',
  styleUrls: ['./energy-form.component.css']
})
export class EnergyFormComponent implements OnInit {
  showOperatingHoursModal: boolean;
  energyForm: FormGroup;
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
  
  constructor(private coolingService: CoolingService,
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
    this.energyUnit = this.coolingService.getAnnualEnergyUnit(this.energyForm.controls.energySourceType.value, this.settings);
    if (this.isBaseline) {
      this.coolingService.energySourceType.next(this.energyForm.controls.energySourceType.value);
    } else {
      let energySource = this.coolingService.energySourceType.getValue();
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
    this.resetDataSub = this.coolingService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.coolingService.generateExample.subscribe(value => {
      this.initForm();
    });
    if (!this.isBaseline) {
      this.energySourceTypeSub = this.coolingService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }
  }

  setEnergySource(energySourceType: string) {
    this.energyForm.patchValue({
      energySourceType: energySourceType
    });
    this.energyUnit = this.coolingService.getAnnualEnergyUnit(energySourceType, this.settings);

    if (this.isBaseline) {
      this.coolingService.energySourceType.next(energySourceType);
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
      energyData = this.coolingService.baselineEnergyData.getValue();
    } else {
      energyData = this.coolingService.modificationEnergyData.getValue();
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
    this.coolingService.currentField.next(str);
  }

  calculate() {
    let currentEnergyData: EnergyData = this.energyFormService.buildEnergyData(this.energyForm);
    if (this.isBaseline) {
      this.coolingService.baselineEnergyData.next(currentEnergyData);
    } else {
      this.coolingService.modificationEnergyData.next(currentEnergyData);
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.coolingService.operatingHours = oppHours;
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
    this.coolingService.modalOpen.next(this.showFlueGasModal);
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
    this.coolingService.modalOpen.next(this.showFlueGasModal);
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
}
