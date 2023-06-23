import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TreasureHunt, EnergyUsage, TreasureHuntResults } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntReportService } from '../treasure-hunt-report/treasure-hunt-report.service';
import { TreasureHuntService } from '../treasure-hunt.service';
import { firstValueFrom, Subscription } from 'rxjs';
 
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { OtherFuel, otherFuels } from '../../calculator/utilities/co2-savings/co2-savings-form/co2FuelSavingsFuels';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-operation-costs',
  templateUrl: './operation-costs.component.html',
  styleUrls: ['./operation-costs.component.css']
})
export class OperationCostsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();

  @ViewChild('modalBody', { static: false }) public modalBody: ElementRef;
  @ViewChild('zipCodeModal', { static: false }) public zipCodeModal: ModalDirective;
  @ViewChild('mixedCO2EmissionsModal', { static: false }) public mixedCO2EmissionsModal: ModalDirective;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getBodyHeight();
  }
  zipCodeModalSub: Subscription;
  mixedCO2EmissionsModalSub: Subscription;
  mixedCO2Emissions: number;
  usingMixedCO2: boolean;

  formWidth: number;
  bodyHeight: number;
  co2SavingsData: Co2SavingsData;

  globalSettings: Settings;

  otherFuels: Array<OtherFuel>;
  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;

  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntResults: TreasureHuntResults;
  saveSettingsOnDestroy: boolean = false;
  electricityModalShown: boolean = false;
  naturalGasEmissionsShown: boolean = false;
  formNotFilledErrorElectricityUnitCosts: boolean = false;
  formNotFilledErrorElectricityAnnualConsumption: boolean = false;
  formNotFilledErrorElectricityAnnualCosts: boolean = false;
  formNotFilledErrorNaturalGasUnitCosts: boolean = false;
  formNotFilledErrorNaturalGasAnnualConsumption: boolean = false;
  formNotFilledErrorNaturalGasAnnualCosts: boolean = false;
  formNotFilledErrorOtherFuelUnitCosts: boolean = false;
  formNotFilledErrorOtherFuelAnnualConsumption: boolean = false;
  formNotFilledErrorOtherFuelAnnualCosts: boolean = false;
  formNotFilledErrorWaterUnitCosts: boolean = false;
  formNotFilledErrorWaterAnnualConsumption: boolean = false;
  formNotFilledErrorWaterAnnualCosts: boolean = false;
  formNotFilledErrorWastewaterUnitCosts: boolean = false;
  formNotFilledErrorWastewaterAnnualConsumption: boolean = false;
  formNotFilledErrorWastewaterAnnualCosts: boolean = false;
  formNotFilledErrorCompressedAirUnitCosts: boolean = false;
  formNotFilledErrorCompressedAirAnnualConsumption: boolean = false;
  formNotFilledErrorCompressedAirAnnualCosts: boolean = false;
  formNotFilledErrorSteamUnitCosts: boolean = false;
  formNotFilledErrorSteamAnnualConsumption: boolean = false;
  formNotFilledErrorSteamAnnualCosts: boolean = false;

  constructor(private treasureHuntReportService: TreasureHuntReportService, private treasureHuntService: TreasureHuntService,
       private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.globalSettings = this.settingsDbService.globalSettings;
    this.otherFuels = otherFuels;
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.initData();
    });
  }

  ngOnDestroy() {
    if (this.saveSettingsOnDestroy == true) {
      this.saveSettings();
    }
    this.treasureHuntSub.unsubscribe();
    this.zipCodeModalSub.unsubscribe();
    this.mixedCO2EmissionsModalSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.zipCodeModalSub = this.zipCodeModal.onShown.subscribe(() => {
      this.getBodyHeight();
    });
    this.mixedCO2EmissionsModalSub = this.mixedCO2EmissionsModal.onShown.subscribe(() => {
      this.getBodyHeight();
    });
  }

  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }

  focusField(inputName: string) {
    this.treasureHuntService.currentField.next(inputName);
  }

  initData() {
    if (this.treasureHunt.currentEnergyUsage == undefined) {
      this.initCurrentEnergyUse();
    }
    this.setCo2SavingsData(); 
    this.setOtherFuelCo2SavingsData();   
    this.setNaturalGasCO2SavingsData(); 

    this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.treasureHunt, this.settings);
    if (this.treasureHuntResults.electricity.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.electricityUsed) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = true;
    }
    if (this.treasureHuntResults.naturalGas.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.naturalGasUsed) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = true;
    }
    if (this.treasureHuntResults.otherFuel.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.otherFuelUsed) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = true;
    }
    if (this.treasureHuntResults.water.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.waterUsed) {
      this.treasureHunt.currentEnergyUsage.waterUsed = true;
    }
    if (this.treasureHuntResults.wasteWater.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.wasteWaterUsed) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = true;
    }
    if (this.treasureHuntResults.compressedAir.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.compressedAirUsed) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = true;
    }
    if (this.treasureHuntResults.steam.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.steamUsed) {
      this.treasureHunt.currentEnergyUsage.steamUsed = true;
    }
  }

  initCurrentEnergyUse() {
    let defaultUsage: EnergyUsage = {
      electricityUsage: 0,
      electricityCosts: 0,
      electricityUsed: false,
      naturalGasUsage: 0,
      naturalGasCosts: 0,
      naturalGasUsed: false,
      otherFuelUsage: 0,
      otherFuelCosts: 0,
      otherFuelUsed: false,
      waterUsage: 0,
      waterCosts: 0,
      waterUsed: false,
      waterCO2OutputRate: 0,
      wasteWaterUsage: 0,
      wasteWaterCosts: 0,
      wasteWaterUsed: false,
      wasteWaterCO2OutputRate: 0,
      compressedAirUsage: 0,
      compressedAirCosts: 0,
      compressedAirUsed: false,
      compressedAirCO2OutputRate: 0,
      steamUsage: 0,
      steamCosts: 0,
      steamUsed: false,
      steamCO2OutputRate: 0,
    }
    this.treasureHunt.currentEnergyUsage = defaultUsage;
    this.setCo2SavingsData(); 
    this.setOtherFuelCo2SavingsData();   
    this.setNaturalGasCO2SavingsData();
    this.save();
  }


  save() {
    if (this.treasureHuntResults){
      this.treasureHuntResults.co2EmissionsResults = this.treasureHuntReportService.getCO2EmissionsResults(this.treasureHunt.currentEnergyUsage, this.treasureHuntResults, this.settings);
    }   
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
  }

  toggleElectricityUsed() {
    if (this.treasureHunt.currentEnergyUsage.electricityUsed != true) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = true;
    } else if (this.treasureHuntResults.electricity.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = false;
      this.treasureHunt.currentEnergyUsage.electricityUsage = 0;
      this.treasureHunt.currentEnergyUsage.electricityCosts = 0;
    }
    this.save();
  }

  toggleNaturalGasUsed() {
    if (this.treasureHunt.currentEnergyUsage.naturalGasUsed != true) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = true;
    } else if (this.treasureHuntResults.naturalGas.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = false;
      this.treasureHunt.currentEnergyUsage.naturalGasUsage = 0;
      this.treasureHunt.currentEnergyUsage.naturalGasCosts = 0;
    }
    this.save();
  }

  toggleOtherFuelUsed() {
    if (this.treasureHunt.currentEnergyUsage.otherFuelUsed != true) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = true;
    } else if (this.treasureHuntResults.otherFuel.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = false;
      this.treasureHunt.currentEnergyUsage.otherFuelUsage = 0;
      this.treasureHunt.currentEnergyUsage.otherFuelCosts = 0;
    }
    this.save();
  }

  toggleWaterUsed() {
    if (this.treasureHunt.currentEnergyUsage.waterUsed != true) {
      this.treasureHunt.currentEnergyUsage.waterUsed = true;
    } else if (this.treasureHuntResults.water.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.waterUsed = false;
      this.treasureHunt.currentEnergyUsage.waterUsage = 0;
      this.treasureHunt.currentEnergyUsage.waterCosts = 0;
      this.treasureHunt.currentEnergyUsage.waterCO2OutputRate = 0;
    }
    this.save();
  }

  toggleWasteWaterUsed() {
    if (this.treasureHunt.currentEnergyUsage.wasteWaterUsed != true) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = true;
    } else if (this.treasureHuntResults.wasteWater.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = false;
      this.treasureHunt.currentEnergyUsage.wasteWaterUsage = 0;
      this.treasureHunt.currentEnergyUsage.wasteWaterCosts = 0;
      this.treasureHunt.currentEnergyUsage.wasteWaterCO2OutputRate = 0;
    }
    this.save();
  }

  toggleCompressedAirUsed() {
    if (this.treasureHunt.currentEnergyUsage.compressedAirUsed != true) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = true;
    } else if (this.treasureHuntResults.compressedAir.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = false;
      this.treasureHunt.currentEnergyUsage.compressedAirUsage = 0;
      this.treasureHunt.currentEnergyUsage.compressedAirCosts = 0;
      this.treasureHunt.currentEnergyUsage.compressedAirCO2OutputRate = 0;
    }
    this.save();
  }

  toggleSteamUsed() {
    if (this.treasureHunt.currentEnergyUsage.steamUsed != true) {
      this.treasureHunt.currentEnergyUsage.steamUsed = true;
    } else if (this.treasureHuntResults.steam.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.steamUsed = false;
      this.treasureHunt.currentEnergyUsage.steamUsage = 0;
      this.treasureHunt.currentEnergyUsage.steamCosts = 0;
      this.treasureHunt.currentEnergyUsage.steamCO2OutputRate = 0;
    }
    this.save();
  }

  setSaveSettings() {
    this.saveSettingsOnDestroy = true;
  }

  async saveSettings() {
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings))
    this.settingsDbService.setAll(updatedSettings);
    this.updateSettings.emit(true);
  }

  setNaturalGasCO2SavingsData(){
    if(!this.treasureHunt.currentEnergyUsage.naturalGasCO2SavingsData){
      let co2SavingsData: Co2SavingsData = {
        energyType: 'fuel',
        energySource: 'Natural Gas',
        fuelType: 'Natural Gas',
        totalEmissionOutputRate: 53.06,
        electricityUse: 0,
        eGridRegion: '',
        eGridSubregion: '',
        totalEmissionOutput: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: ''
      }
      this.treasureHunt.currentEnergyUsage.naturalGasCO2SavingsData = co2SavingsData;
    }

  }
  showZipCodeModal() {
    this.electricityModalShown = true;
    this.treasureHuntService.modalOpen.next(true);
    this.zipCodeModal.show();
  }

  hideZipCodeModal() {
    this.treasureHuntService.modalOpen.next(false);
    this.zipCodeModal.hide();
    this.electricityModalShown = false;
  }

  applyModalData() {
    this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData = this.co2SavingsData;
    this.save();
    this.treasureHuntService.modalOpen.next(false);
    this.zipCodeModal.hide();
  }

  updateElectricityCo2SavingsData(co2SavingsData?: Co2SavingsData) {
    this.co2SavingsData = co2SavingsData;
  }

  setCo2SavingsData() {
    if (this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData) {
      this.co2SavingsData = this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData;
    } else {
      let convertOutputRate: number = this.globalSettings.totalEmissionOutputRate/1000;
      let co2SavingsData: Co2SavingsData = {
        energyType: 'electricity',
        energySource: '',
        fuelType: '',
        totalEmissionOutputRate: convertOutputRate,
        electricityUse: 0,
        eGridRegion: '',
        eGridSubregion: this.globalSettings.eGridSubregion,
        totalEmissionOutput: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: this.globalSettings.zipcode
      }
      this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData = co2SavingsData;
      this.co2SavingsData = this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData;
    }
  }

  setOtherFuelCo2SavingsData() {
    if (!this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData) {
      let co2SavingsData: Co2SavingsData = {
        energyType: 'fuel',
        energySource: 'Petroleum-based fuels',
        fuelType: 'Motor Gasoline',
        totalEmissionOutputRate: 70.22,
        electricityUse: 0,
        eGridRegion: '',
        eGridSubregion: '',
        totalEmissionOutput: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: ''
      }
      this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData = co2SavingsData; 
      if (!this.treasureHunt.currentEnergyUsage.otherFuelMixedCO2SavingsData) {
        this.treasureHunt.currentEnergyUsage.otherFuelMixedCO2SavingsData = new Array<Co2SavingsData>();
      }
  
      
    }
    
    this.checkIsUsingMixedFuel();

    this.setFuelOptions();
  }

  checkIsUsingMixedFuel(){
    if(this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.energySource == 'Mixed Fuels'){
      this.usingMixedCO2 = true;
    } else{
      this.usingMixedCO2 = false;
    }
  }

  setFuelOptions(){    
    let tmpOtherFuel: OtherFuel = _.find(this.otherFuels, (val) => { return this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.energySource === val.energySource; });
    this.fuelOptions = tmpOtherFuel.fuelTypes;
    
  }

  setEnergySource() {
    this.setFuelOptions();
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.fuelType = this.fuelOptions[0].fuelType;
    let outputRate: number = this.fuelOptions[0].outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(2));
    }
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = outputRate;
    this.checkIsUsingMixedFuel();
    this.save();
  }

  setFuel() {
    let tmpFuel: { fuelType: string, outputRate: number } = _.find(this.fuelOptions, (val) => { return this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.fuelType === val.fuelType; });
    let outputRate: number = tmpFuel.outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(2));
    }
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = outputRate;
    this.save();
  }

  
  showMixedCO2EmissionsModal() {
    this.naturalGasEmissionsShown = true;
    this.treasureHuntService.modalOpen.next(true);
    this.mixedCO2EmissionsModal.show();
  }

  hideMixedCO2EmissionsModal() {
    this.treasureHuntService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
    this.naturalGasEmissionsShown = false;
  }

  updateMixedCO2EmissionsModalData(mixedOutputRate: number) {
    this.mixedCO2Emissions = mixedOutputRate;
  }

  applyMixedCO2EmissionsModal() {
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.energySource = 'Mixed Fuels';
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.fuelType = undefined;
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = this.mixedCO2Emissions;
    this.usingMixedCO2 = true;
    this.save();
    this.treasureHuntService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
  }
  
  saveOtherFuelsMixedList(mixedFuelsList: Array<Co2SavingsData>) {
    this.treasureHunt.currentEnergyUsage.otherFuelMixedCO2SavingsData = mixedFuelsList;
    this.save();
  }

  calculateElectricityUnitCosts(){
    this.checkElectricityForm();
    let annualElectricityCosts: number = this.treasureHunt.currentEnergyUsage.electricityCosts;
    let annualElectricityUsage: number = this.treasureHunt.currentEnergyUsage.electricityUsage;
    if (!annualElectricityCosts || !annualElectricityUsage)
    {
      this.formNotFilledErrorElectricityUnitCosts = true;
      this.formNotFilledErrorElectricityAnnualConsumption = false;
      this.formNotFilledErrorElectricityAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorElectricityUnitCosts = false;
      this.settings.electricityCost = annualElectricityCosts/annualElectricityUsage;
    }
    this.save();
  }

  calculateElectricityAnnualConsumption(){
    this.checkElectricityForm();
    let electricityCost: number = this.settings.electricityCost;
    let annualElectricityCosts: number = this.treasureHunt.currentEnergyUsage.electricityCosts;
    if (!annualElectricityCosts || !electricityCost)
    {
      this.formNotFilledErrorElectricityAnnualConsumption = true;
      this.formNotFilledErrorElectricityUnitCosts = false;
      this.formNotFilledErrorElectricityAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorElectricityAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.electricityUsage = annualElectricityCosts/electricityCost;
    }
    this.save();
  }

  calculateElectricityAnnualCosts(){
    this.checkElectricityForm();
    let electricityCost: number = this.settings.electricityCost;
    let annualElectricityUsage: number = this.treasureHunt.currentEnergyUsage.electricityUsage;
    if (!electricityCost || !annualElectricityUsage)
    {
      this.formNotFilledErrorElectricityAnnualCosts = true;
      this.formNotFilledErrorElectricityUnitCosts = false;
      this.formNotFilledErrorElectricityAnnualConsumption = false;
    }
    else
    {
      this.formNotFilledErrorElectricityAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.electricityCosts = electricityCost * annualElectricityUsage;
    }
    this.save();
  }

  checkElectricityForm(){
    let electricityCost: number = this.settings.electricityCost;
    let annualElectricityUsage: number = this.treasureHunt.currentEnergyUsage.electricityUsage;
    let annualElectricityCosts: number = this.treasureHunt.currentEnergyUsage.electricityCosts;
    if ((electricityCost && annualElectricityUsage) || (electricityCost && annualElectricityCosts) || (annualElectricityUsage && annualElectricityCosts)){
      this.formNotFilledErrorElectricityUnitCosts = false;
      this.formNotFilledErrorElectricityAnnualConsumption = false;
      this.formNotFilledErrorElectricityAnnualCosts = false;
    }
    this.save();
  }

  calculateNaturalGasUnitCosts(){
    this.checkNaturalGasForm();
    let annualNaturalGasUsage: number = this.treasureHunt.currentEnergyUsage.naturalGasUsage;
    let annualNaturalGasCosts: number = this.treasureHunt.currentEnergyUsage.naturalGasCosts;
    if (!annualNaturalGasUsage || !annualNaturalGasCosts){
      this.formNotFilledErrorNaturalGasUnitCosts = true;
      this.formNotFilledErrorNaturalGasAnnualConsumption = false;
      this.formNotFilledErrorNaturalGasAnnualCosts = false;    
    }
    else
    {
      this.formNotFilledErrorNaturalGasUnitCosts = false;
      this.settings.fuelCost = annualNaturalGasCosts/annualNaturalGasUsage;
    }
    this.save();
  }

  calculateNaturalGasAnnualConsumption(){
    this.checkNaturalGasForm();
    let naturalGasCost: number = this.settings.fuelCost;
    let annualNaturalGasCosts: number = this.treasureHunt.currentEnergyUsage.naturalGasCosts;
    if (!annualNaturalGasCosts || !naturalGasCost){
      this.formNotFilledErrorNaturalGasUnitCosts = false;
      this.formNotFilledErrorNaturalGasAnnualConsumption = true;
      this.formNotFilledErrorNaturalGasAnnualCosts = false;    
    }
    else
    {
      this.formNotFilledErrorNaturalGasAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.naturalGasUsage = annualNaturalGasCosts/naturalGasCost;
    }
    this.save();
  }

  calculateNaturalGasAnnualCosts(){
    this.checkNaturalGasForm();
    let naturalGasCost: number = this.settings.fuelCost;
    let annualNaturalGasUsage: number = this.treasureHunt.currentEnergyUsage.naturalGasUsage;
    if (!naturalGasCost || !annualNaturalGasUsage){
      this.formNotFilledErrorNaturalGasUnitCosts = false;
      this.formNotFilledErrorNaturalGasAnnualConsumption = false;
      this.formNotFilledErrorNaturalGasAnnualCosts = true;    
    }
    else
    {
      this.formNotFilledErrorNaturalGasAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.naturalGasCosts = naturalGasCost * annualNaturalGasUsage;
    }
    this.save();
  }

  checkNaturalGasForm(){
    let naturalGasCost: number = this.settings.fuelCost;
    let annualNaturalGasUsage: number = this.treasureHunt.currentEnergyUsage.naturalGasUsage;
    let annualNaturalGasCosts: number = this.treasureHunt.currentEnergyUsage.naturalGasCosts;
    if ((naturalGasCost && annualNaturalGasUsage) || (naturalGasCost && annualNaturalGasCosts) || (annualNaturalGasUsage && annualNaturalGasCosts)) {
      this.formNotFilledErrorNaturalGasUnitCosts = false;
      this.formNotFilledErrorNaturalGasAnnualConsumption = false;
      this.formNotFilledErrorNaturalGasAnnualCosts = false;
    }
    this.save();
  }
  
  calculateOtherFuelUnitCosts(){
    this.checkOtherFuelForm();
    let annualOtherFuelCosts: number = this.treasureHunt.currentEnergyUsage.otherFuelCosts;
    let annualOtherFuelUsage: number = this.treasureHunt.currentEnergyUsage.otherFuelUsage;
    if (!annualOtherFuelCosts || !annualOtherFuelUsage)
    {
      this.formNotFilledErrorOtherFuelUnitCosts = true;
      this.formNotFilledErrorOtherFuelAnnualConsumption = false;
      this.formNotFilledErrorOtherFuelAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorOtherFuelUnitCosts = false;
      this.settings.otherFuelCost = annualOtherFuelCosts/annualOtherFuelUsage;
    }
    this.save();
  }

  calculateOtherFuelAnnualConsumption(){
    this.checkOtherFuelForm();
    let otherFuelCost: number = this.settings.otherFuelCost;
    let annualOtherFuelCosts: number = this.treasureHunt.currentEnergyUsage.otherFuelCosts;
    if (!annualOtherFuelCosts || !otherFuelCost)
    {
      this.formNotFilledErrorOtherFuelUnitCosts = false;
      this.formNotFilledErrorOtherFuelAnnualConsumption = true;
      this.formNotFilledErrorOtherFuelAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorOtherFuelAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.otherFuelUsage = annualOtherFuelCosts/otherFuelCost;
    }
    this.save();
  }

  calculateOtherFuelAnnualCosts(){
    this.checkOtherFuelForm();
    let otherFuelCost: number = this.settings.otherFuelCost;
    let annualOtherFuelUsage: number = this.treasureHunt.currentEnergyUsage.otherFuelUsage;
    if (!otherFuelCost || !annualOtherFuelUsage)
    {
      this.formNotFilledErrorOtherFuelUnitCosts = false;
      this.formNotFilledErrorOtherFuelAnnualConsumption = false;
      this.formNotFilledErrorOtherFuelAnnualCosts = true;
    }
    else
    {
      this.formNotFilledErrorOtherFuelAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.otherFuelCosts = otherFuelCost * annualOtherFuelUsage;
    }
    this.save();
  }

  checkOtherFuelForm(){
    let otherFuelCost: number = this.settings.otherFuelCost;
    let annualOtherFuelUsage: number = this.treasureHunt.currentEnergyUsage.otherFuelUsage;
    let annualOtherFuelCosts: number = this.treasureHunt.currentEnergyUsage.otherFuelCosts;
    if ((otherFuelCost && annualOtherFuelUsage) || (otherFuelCost && annualOtherFuelCosts) || (annualOtherFuelUsage && annualOtherFuelCosts)){
      this.formNotFilledErrorOtherFuelUnitCosts = false;
      this.formNotFilledErrorOtherFuelAnnualConsumption = false;
      this.formNotFilledErrorOtherFuelAnnualCosts = false;
    }
    this.save();
  }

  calculateWaterUnitCosts(){
    this.checkWaterForm();
    let annualWaterCosts: number = this.treasureHunt.currentEnergyUsage.waterCosts;
    let annualWaterUsage: number = this.treasureHunt.currentEnergyUsage.waterUsage;
    if (!annualWaterCosts || !annualWaterUsage)
    {
      this.formNotFilledErrorWaterUnitCosts = true;
      this.formNotFilledErrorWaterAnnualConsumption = false;
      this.formNotFilledErrorWaterAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorWaterUnitCosts = false;
      this.settings.waterCost = annualWaterCosts/annualWaterUsage;
    }
    this.save();
  }

  calculateWaterAnnualConsumption(){
    this.checkWaterForm();
    let waterCost: number = this.settings.waterCost;
    let annualWaterCosts: number = this.treasureHunt.currentEnergyUsage.waterCosts;
    if (!annualWaterCosts || !waterCost)
    {
      this.formNotFilledErrorWaterUnitCosts = false;
      this.formNotFilledErrorWaterAnnualConsumption = true;
      this.formNotFilledErrorWaterAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorWaterAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.waterUsage = annualWaterCosts/waterCost;
    }
    this.save();
  }

  calculateWaterAnnualCosts(){
    this.checkWaterForm();
    let waterCost: number = this.settings.waterCost;
    let annualWaterUsage: number = this.treasureHunt.currentEnergyUsage.waterUsage;
    if (!waterCost || !annualWaterUsage)
    {
      this.formNotFilledErrorWaterUnitCosts = false;
      this.formNotFilledErrorWaterAnnualConsumption = false;
      this.formNotFilledErrorWaterAnnualCosts = true;
    }
    else
    {
      this.formNotFilledErrorWaterAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.waterCosts = waterCost * annualWaterUsage;
    }
    this.save();
  }

  checkWaterForm(){
    let waterCost: number = this.settings.waterCost;
    let annualWaterUsage: number = this.treasureHunt.currentEnergyUsage.waterUsage;
    let annualWaterCosts: number = this.treasureHunt.currentEnergyUsage.waterCosts;
    if ((waterCost && annualWaterUsage) || (waterCost && annualWaterCosts) || (annualWaterUsage && annualWaterCosts)){
      this.formNotFilledErrorWaterUnitCosts = false;
      this.formNotFilledErrorWaterAnnualConsumption = false;
      this.formNotFilledErrorWaterAnnualCosts = false;
    }
    this.save();
  }

  calculateWastewaterUnitCosts(){
    this.checkWastewaterForm();
    let annualWastewaterCosts: number = this.treasureHunt.currentEnergyUsage.wasteWaterCosts;
    let annualWastewaterUsage: number = this.treasureHunt.currentEnergyUsage.wasteWaterUsage;
    if (!annualWastewaterCosts || !annualWastewaterUsage)
    {
      this.formNotFilledErrorWastewaterUnitCosts = true;
      this.formNotFilledErrorWastewaterAnnualConsumption = false;
      this.formNotFilledErrorWastewaterAnnualCosts = false;    
    }
    else
    {
      this.formNotFilledErrorWastewaterUnitCosts = false;
      this.settings.waterWasteCost = annualWastewaterCosts/annualWastewaterUsage;
    }
    this.save();
  }

  calculateWastewaterAnnualConsumption(){
    this.checkWastewaterForm();
    let wastewaterCost: number = this.settings.waterWasteCost;
    let annualWastewaterCosts: number = this.treasureHunt.currentEnergyUsage.wasteWaterCosts;
    if (!annualWastewaterCosts || !wastewaterCost)
    {
      this.formNotFilledErrorWastewaterUnitCosts = false;
      this.formNotFilledErrorWastewaterAnnualConsumption = true;
      this.formNotFilledErrorWastewaterAnnualCosts = false;    
    }
    else
    {
      this.formNotFilledErrorWastewaterAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.wasteWaterUsage = annualWastewaterCosts/wastewaterCost;
    }
    this.save();
  }

  calculateWastewaterAnnualCosts(){
    this.checkWastewaterForm();
    let wastewaterCost: number = this.settings.waterWasteCost;
    let annualWastewaterUsage: number = this.treasureHunt.currentEnergyUsage.wasteWaterUsage;
    if (!wastewaterCost || !annualWastewaterUsage)
    {
      this.formNotFilledErrorWastewaterUnitCosts = false;
      this.formNotFilledErrorWastewaterAnnualConsumption = false;
      this.formNotFilledErrorWastewaterAnnualCosts = true;    
    }
    else
    {
      this.formNotFilledErrorWastewaterAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.wasteWaterCosts = wastewaterCost * annualWastewaterUsage;
    }
    this.save();
  }

  checkWastewaterForm()
  {
    let wastewaterCost: number = this.settings.waterWasteCost;
    let annualWastewaterUsage: number = this.treasureHunt.currentEnergyUsage.wasteWaterUsage;
    let annualWastewaterCosts: number = this.treasureHunt.currentEnergyUsage.wasteWaterCosts;
    if ((wastewaterCost && annualWastewaterUsage) || (wastewaterCost && annualWastewaterCosts) || (annualWastewaterUsage && annualWastewaterCosts)){
      this.formNotFilledErrorWastewaterUnitCosts = false;
      this.formNotFilledErrorWastewaterAnnualConsumption = false;
      this.formNotFilledErrorWastewaterAnnualCosts = false;
    }
    this.save();
  }

  calculateCompressedAirUnitCosts(){
    this.checkCompressedAirForm();
    let annualCompressedAirCosts: number = this.treasureHunt.currentEnergyUsage.compressedAirCosts;
    let annualCompressedAirUsage: number = this.treasureHunt.currentEnergyUsage.compressedAirUsage;
    if (!annualCompressedAirCosts || !annualCompressedAirUsage)
    {
      this.formNotFilledErrorCompressedAirUnitCosts = true;
      this.formNotFilledErrorCompressedAirAnnualConsumption = false;
      this.formNotFilledErrorCompressedAirAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorCompressedAirUnitCosts = false;
      this.settings.compressedAirCost = annualCompressedAirCosts/annualCompressedAirUsage;
    }
    this.save();
  }

  calculateCompressedAirAnnualConsumption(){
    this.checkCompressedAirForm();
    let compressedAirCost: number = this.settings.compressedAirCost;
    let annualCompressedAirCosts: number = this.treasureHunt.currentEnergyUsage.compressedAirCosts;
    if (!annualCompressedAirCosts || !compressedAirCost)
    {
      this.formNotFilledErrorCompressedAirUnitCosts = false;
      this.formNotFilledErrorCompressedAirAnnualConsumption = true;
      this.formNotFilledErrorCompressedAirAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorCompressedAirAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.compressedAirUsage = annualCompressedAirCosts/compressedAirCost;
    }
    this.save();
  }

  calculateCompressedAirAnnualCosts(){
    this.checkCompressedAirForm();
    let compressedAirCost: number = this.settings.compressedAirCost;
    let annualCompressedAirUsage: number = this.treasureHunt.currentEnergyUsage.compressedAirUsage;
    if (!compressedAirCost || !annualCompressedAirUsage)
    {
      this.formNotFilledErrorCompressedAirUnitCosts = false;
      this.formNotFilledErrorCompressedAirAnnualConsumption = false;
      this.formNotFilledErrorCompressedAirAnnualCosts = true;
    }
    else
    {
      this.formNotFilledErrorCompressedAirAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.compressedAirCosts = compressedAirCost * annualCompressedAirUsage;
    }
    this.save();
  }

  checkCompressedAirForm(){
    let compressedAirCost: number = this.settings.compressedAirCost;
    let annualCompressedAirUsage: number = this.treasureHunt.currentEnergyUsage.compressedAirUsage;
    let annualCompressedAirCosts: number = this.treasureHunt.currentEnergyUsage.compressedAirCosts;
    if ((compressedAirCost && annualCompressedAirUsage) || (compressedAirCost && annualCompressedAirCosts) || (annualCompressedAirUsage && annualCompressedAirCosts)){
      this.formNotFilledErrorCompressedAirUnitCosts = false;
      this.formNotFilledErrorCompressedAirAnnualConsumption = false;
      this.formNotFilledErrorCompressedAirAnnualCosts = false;
    }
    this.save();
  }

  calculateSteamUnitCosts(){
    this.checkSteamForm();
    let annualSteamCosts: number = this.treasureHunt.currentEnergyUsage.steamCosts;
    let annualSteamUsage: number = this.treasureHunt.currentEnergyUsage.steamUsage;
    if (!annualSteamCosts || !annualSteamUsage)
    {
      this.formNotFilledErrorSteamUnitCosts = true;
      this.formNotFilledErrorSteamAnnualConsumption = false;
      this.formNotFilledErrorSteamAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorSteamUnitCosts = false;
      this.settings.steamCost = annualSteamCosts/annualSteamUsage;
    }
    this.save();
  }

  calculateSteamAnnualConsumption(){
    this.checkSteamForm();
    let steamCost: number = this.settings.steamCost;
    let annualSteamCosts: number = this.treasureHunt.currentEnergyUsage.steamCosts;
    if (!annualSteamCosts || !steamCost)
    {
      this.formNotFilledErrorSteamUnitCosts = false;
      this.formNotFilledErrorSteamAnnualConsumption = true;
      this.formNotFilledErrorSteamAnnualCosts = false;
    }
    else
    {
      this.formNotFilledErrorSteamAnnualConsumption = false;
      this.treasureHunt.currentEnergyUsage.steamUsage = annualSteamCosts/steamCost;
    }
    this.save();
  }

  calculateSteamAnnualCosts(){
    this.checkSteamForm();
    let steamCost: number = this.settings.steamCost;
    let annualSteamUsage: number = this.treasureHunt.currentEnergyUsage.steamUsage;
    if (!steamCost || !annualSteamUsage)
    {
      this.formNotFilledErrorSteamUnitCosts = false;
      this.formNotFilledErrorSteamAnnualConsumption = false;
      this.formNotFilledErrorSteamAnnualCosts = true;
    }
    else
    {
      this.formNotFilledErrorSteamAnnualCosts = false;
      this.treasureHunt.currentEnergyUsage.steamCosts = steamCost * annualSteamUsage;
    }
    this.save();
  }

  checkSteamForm(){
    let steamCost: number = this.settings.steamCost;
    let annualSteamUsage: number = this.treasureHunt.currentEnergyUsage.steamUsage;
    let annualSteamCosts: number = this.treasureHunt.currentEnergyUsage.steamCosts;
    if ((steamCost && annualSteamUsage) || (steamCost && annualSteamCosts) || (annualSteamUsage && annualSteamCosts)){
      this.formNotFilledErrorSteamUnitCosts = false;
      this.formNotFilledErrorSteamAnnualConsumption = false;
      this.formNotFilledErrorSteamAnnualCosts = false;
    }
    this.save();
  }
}
