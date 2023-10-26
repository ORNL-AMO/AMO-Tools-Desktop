import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { EnergyInputExhaustGasCompareService } from '../energy-input-exhaust-gas-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { LossesService } from '../../losses.service';

@Component({
  selector: 'app-energy-input-exhaust-gas-form',
  templateUrl: './energy-input-exhaust-gas-form.component.html',
  styleUrls: ['./energy-input-exhaust-gas-form.component.css']
})
export class EnergyInputExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;

  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;


  showFlueGasModal: boolean;

  combustionTempWarning: string = null;
  heatWarning: string = null;
  firstChange: boolean = true;
  idString: string;
  constructor(private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService,
    private lossesService: LossesService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.save();
  }
  
  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  save() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  canCompare() {
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareAvailableHeat(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareAvailableHeat(this.lossIndex);
    } else {
      return false;
    }
  }

  compareTotalHeatInput(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareTotalHeatInput(this.lossIndex);
    } else {
      return false;
    }
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.lossesService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.exhaustGasForm.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.lossesService.modalOpen.next(this.showFlueGasModal);
    this.cd.detectChanges();
    this.save();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
}
