import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ValveEnergyLossFormService } from './valve-energy-loss-form.service';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ValveEnergyLossService } from '../valve-energy-loss.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { ValveEnergyLossInputs } from '../../../../shared/models/calculators';

@Component({
  selector: 'app-valve-energy-loss-form',
  templateUrl: './valve-energy-loss-form.component.html',
  styleUrl: './valve-energy-loss-form.component.css',
  standalone: false
})
export class ValveEnergyLossFormComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  selected: boolean;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  showOperatingHoursModal: boolean;
  form: UntypedFormGroup;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  baselineDataSub: Subscription;

  formWidth: number;
  index: number = 0;
  idString: string;

  constructor(
    private valveEnergyLossService: ValveEnergyLossService,
    private valveEnergyLossFormService: ValveEnergyLossFormService,
    private cd: ChangeDetectorRef,
  ) { }

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
    this.baselineDataSub.unsubscribe();
  }

  initSubscriptions() {
    this.resetDataSub = this.valveEnergyLossService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.valveEnergyLossService.generateExample.subscribe(value => {
      this.initForm();
    });
    // this.baselineDataSub = this.valveEnergyLossService.baselineData.subscribe(baselineData => {
    //   if (baselineData) {
    //     this.initForm(baselineData);
    //     //this.valveEnergyLossService.calculate(this.settings, false, true);
    //   }
    // });
  }

  setFormState() {
    if (this.selected == false) {
      this.form.disable();
    } else {
      this.form.enable();
    }
    this.cd.detectChanges();
  }

  initForm(inputs?: ValveEnergyLossInputs) {
    if (inputs) {
      this.form = this.valveEnergyLossFormService.getFormFromObj(inputs);
    }
    let energyData: ValveEnergyLossInputs;
    if (this.isBaseline) {
      energyData = this.valveEnergyLossService.baselineData.getValue();
    } else {
      energyData = this.valveEnergyLossService.modificationData.getValue();
    }
    if (energyData) {
      this.form = this.valveEnergyLossFormService.getFormFromObj(energyData);
    } else {
      this.form = this.valveEnergyLossFormService.initForm();
    }
    this.calculate();
    this.setFormState();
  }


  focusField(str: string) {
    this.valveEnergyLossService.currentField.next(str);
  }

  calculate() {
    let currentEnergyData: ValveEnergyLossInputs = this.valveEnergyLossFormService.getObjFromForm(this.form);
    if (this.isBaseline) {
      this.valveEnergyLossService.baselineData.next(currentEnergyData);
    } else {
      this.valveEnergyLossService.modificationData.next(currentEnergyData);
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.valveEnergyLossService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

}
