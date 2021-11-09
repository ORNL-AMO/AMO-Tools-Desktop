import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { EnergyFormService, FlueGasEnergyData } from '../energy-form.service';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-energy-form',
  templateUrl: './energy-form.component.html',
  styleUrls: ['./energy-form.component.css']
})
export class EnergyFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  method: string;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  selected: boolean;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  showOperatingHoursModal: boolean;
  energyForm: FormGroup;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showFlueGasModal: boolean;

  formWidth: number;
  energyUnit: string;
  index: number = 0;
  idString: string;
  constructor(private flueGasService: FlueGasService,
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initSubscriptions() {
    this.resetDataSub = this.flueGasService.resetData.subscribe(value => {
      this.initForm();
      });
    this.generateExampleSub = this.flueGasService.generateExample.subscribe(value => {
      this.initForm();
    });
  }

  setFormState() {
    if (this.selected == false) {
      this.energyForm.disable();
    } else {
      this.energyForm.enable();
    }
    this.cd.detectChanges();
  }


  initForm() {
    let energyData: FlueGasEnergyData;
    if (this.isBaseline) {
      energyData = this.flueGasService.baselineEnergyData.getValue();
    } else {
      energyData = this.flueGasService.modificationEnergyData.getValue();
    }
    if (energyData) {
      this.energyForm = this.energyFormService.getEnergyForm(energyData);
    } else {
      this.energyForm = this.energyFormService.initEnergyForm();
    }

    if (!this.energyForm.controls.fuelCost.value) {
      this.energyForm.patchValue({
        fuelCost: this.settings.fuelCost,
      });
    }

    this.calculate();
    this.setFormState();
  }


  focusField(str: string) {
    this.flueGasService.currentField.next(str);
  }

  calculate() {
    let currentEnergyData: FlueGasEnergyData = this.energyFormService.buildEnergyData(this.energyForm);
    if (this.isBaseline) {
      this.flueGasService.baselineEnergyData.next(currentEnergyData);
    } else {
      this.flueGasService.modificationEnergyData.next(currentEnergyData);
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.flueGasService.operatingHours = oppHours;
    this.energyForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
