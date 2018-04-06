import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasByMass, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { LossTab } from '../../../tabs';

@Component({
  selector: 'app-explore-flue-gas-form',
  templateUrl: './explore-flue-gas-form.component.html',
  styleUrls: ['./explore-flue-gas-form.component.css']
})
export class ExploreFlueGasFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();


  baselineFlueGas: FlueGasByMass | FlueGasByVolume;
  modifiedFlueGas: FlueGasByMass | FlueGasByVolume;

  showFlueGas: boolean = false;
  showExcessAir: boolean = false;
  showO2: boolean = false;
  showFuelTemp: boolean = false;
  showAirTemp: boolean = false;
  constructor() { }

  ngOnInit() {
    this.initData();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
      }
    }
  }

  initData(){
    if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByMass;
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByMass;
    } else {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByVolume;
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByVolume;
    }
    this.initFuelTemp();
    this.initExcessAir();
    this.initO2();
    this.initAirTemp();
    this.initFlueGas();
  }

  initFuelTemp(){
    if(this.baselineFlueGas.flueGasTemperature != this.modifiedFlueGas.flueGasTemperature){
      this.showFuelTemp = true;
    }else{
      this.showFuelTemp = false;
    }
  }

  initExcessAir(){
    if(this.baselineFlueGas.excessAirPercentage != this.modifiedFlueGas.excessAirPercentage){
      this.showExcessAir = true;
    }else{
       this.showExcessAir = false;
    }
  }

  initO2(){
    if(this.baselineFlueGas.o2InFlueGas != this.modifiedFlueGas.o2InFlueGas){
      this.showO2 = true;
    }else{
      this.showO2 = false;
    }
  }

  initAirTemp(){
    if(this.baselineFlueGas.combustionAirTemperature != this.modifiedFlueGas.combustionAirTemperature){
      this.showAirTemp = true;
    }else{
      this.showAirTemp = false;
    }
  }

  initFlueGas(){
    if(this.showAirTemp || this.showO2 || this.showExcessAir || this.showFuelTemp){
      this.showFlueGas = true;
    }else{
      this.showFlueGas = false;
    }
  }

  toggleFlueGas() {
    if(this.showFlueGas == false){
      this.showExcessAir = false;
      this.showAirTemp = false;
      this.showFuelTemp = false;
      this.showO2 = false;
      this.toggleAirTemp();
      this.toggleExcessAir();
      this.toggleFuelTemp();
      this.toggleO2();
    }
  }

  toggleAirTemp() {
    if(this.showAirTemp == false){
      this.modifiedFlueGas.combustionAirTemperature = this.baselineFlueGas.combustionAirTemperature;
      this.calculate();
    }
  }

  toggleFuelTemp() { 
    if(this.showFuelTemp == false){
      this.modifiedFlueGas.flueGasTemperature = this.baselineFlueGas.flueGasTemperature;
      this.calculate();
    }
  }

  toggleExcessAir() {
    if(this.showExcessAir == false){
      this.modifiedFlueGas.excessAirPercentage = this.baselineFlueGas.excessAirPercentage;
      this.calculate();
    }
   }

  toggleO2() { 
    if(this.showO2 == false){
      this.modifiedFlueGas.o2InFlueGas = this.baselineFlueGas.o2InFlueGas;
      this.calculate();
    }
  }

  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Flue Gas',
      step: 1,
      componentStr: 'flue-gas-losses' 
    })
  }

}
