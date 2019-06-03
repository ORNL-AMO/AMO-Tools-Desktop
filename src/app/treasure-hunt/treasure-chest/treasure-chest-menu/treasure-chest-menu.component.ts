import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-treasure-chest-menu',
  templateUrl: './treasure-chest-menu.component.html',
  styleUrls: ['./treasure-chest-menu.component.css']
})
export class TreasureChestMenuComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;

  @Output('emitChangeEnergyType')
  emitChangeEnergyType = new EventEmitter<string>();
  @Output('emitChangeCalculatorType')
  emitChangeCalculatorType = new EventEmitter<string>();

  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';

  energyTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  calculatorTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  constructor() { }

  ngOnInit() {
    this.setEnergyTypeOptions();
  }

  setEnergyType() {
    this.displayCalculatorType = 'All';
    this.setCalculatorType();
    this.emitChangeEnergyType.emit(this.displayEnergyType);
    this.setCalculatorOptions();
  }

  setCalculatorType() {
    this.emitChangeCalculatorType.emit(this.displayCalculatorType);
  }

  setEnergyTypeOptions() {
    let numElectricity: number = this.checkElectricity();
    if (numElectricity) {
      this.energyTypeOptions.push({ value: 'Electricity', numCalcs: numElectricity });
    }
    let numOppSheets: number = this.checkOpportunitySheets();
    if (numOppSheets) {
      this.energyTypeOptions.push({ value: 'Other', numCalcs: numOppSheets });
    }
    let numGas: number = this.checkGas();
    if (numGas) {
      this.energyTypeOptions.push({ value: 'Natural Gas', numCalcs: numGas });
    }
    this.energyTypeOptions.unshift({ value: 'All', numCalcs: numElectricity + numOppSheets + numGas });
    this.calculatorTypeOptions.unshift({ value: 'All', numCalcs: numElectricity + numOppSheets + numGas });
  
    let numCompAir: number = this.checkCompressedAir();

  }

  setCalculatorOptions() {
    this.calculatorTypeOptions = new Array();
    let numCalcs: number = 0;
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Electricity') {
      numCalcs = numCalcs + this.checkElectricity();
    }
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Other') {
      numCalcs = numCalcs + this.checkOpportunitySheets();
    }
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Natural Gas') {
      numCalcs = numCalcs + this.checkGas();
    }
    this.calculatorTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
  }

  checkElectricity(): number {
    let numElectricity: number = 0;
    if (this.treasureHunt.lightingReplacements && this.treasureHunt.lightingReplacements.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Lighting Replacement', numCalcs: this.treasureHunt.lightingReplacements.length });
      numElectricity = this.treasureHunt.lightingReplacements.length;
    }
    if (this.treasureHunt.motorDrives && this.treasureHunt.motorDrives.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Upgrade Motor Drive', numCalcs: this.treasureHunt.motorDrives.length });
      numElectricity = numElectricity + this.treasureHunt.motorDrives.length;
    }
    if (this.treasureHunt.replaceExistingMotors && this.treasureHunt.replaceExistingMotors.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Replace Existing Motor', numCalcs: this.treasureHunt.replaceExistingMotors.length });
      numElectricity = numElectricity + this.treasureHunt.replaceExistingMotors.length;
    }
    if (this.treasureHunt.electricityReductions && this.treasureHunt.electricityReductions.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Electricity Reduction', numCalcs: this.treasureHunt.electricityReductions.length });
      numElectricity = numElectricity + this.treasureHunt.electricityReductions.length;
    }
    return numElectricity;
  }

  checkOpportunitySheets(): number {
    let numOppSheets: number = 0;
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Opportunity Sheet', numCalcs: this.treasureHunt.opportunitySheets.length });
      numOppSheets = this.treasureHunt.opportunitySheets.length;
    }
    return numOppSheets;
  }

  checkGas(): number {
    let numGas: number = 0;
    if (this.treasureHunt.naturalGasReductions && this.treasureHunt.naturalGasReductions.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Natural Gas Reduction', numCalcs: this.treasureHunt.naturalGasReductions.length });
      numGas = numGas + this.treasureHunt.naturalGasReductions.length;
    }
    return numGas;
  }

  checkCompressedAir(): number{
    let numCompressedAir
    return 0;
  }


}
