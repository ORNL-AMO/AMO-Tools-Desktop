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
import { current } from '../../shared/convert-units/definitions/current';

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

  electrictyFormErrorText: string;
  naturalGasFormErrorText: string;
  otherFuelFormErrorText: string;
  waterFormErrorText: string;
  wastewaterFormErrorText: string;
  compressedAirFormErrorText: string;
  steamFormErrorText: string;

  currentError: string;

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

  getFormValues(type: string): [number, number, number, string]{
    let unitCosts: number;
    let annualUsage: number;
    let annualCosts: number;
    let capitalized: string;
    if (type == 'wastewater'){
      unitCosts = this.settings.waterWasteCost;
      annualUsage = this.treasureHunt.currentEnergyUsage.wasteWaterUsage;
      annualCosts = this.treasureHunt.currentEnergyUsage.wasteWaterCosts;
      capitalized = 'Wastewater';
    }
    else {
      if (type == 'naturalGas'){
        unitCosts = this.settings.fuelCost;
      }
      else {
        unitCosts = this.settings[(type + 'Cost')];
      }
      annualUsage = this.treasureHunt.currentEnergyUsage[(type + 'Usage')];
      annualCosts = this.treasureHunt.currentEnergyUsage[(type + 'Costs')];
      capitalized = type.charAt(0).toUpperCase() + type.slice(1);
    }
    return [unitCosts, annualUsage, annualCosts, capitalized];
  }

  calculateValue(type: string,  value: string)
  {
    this.updateErrorText(type, value, true);
    const values: [number, number, number, string] = this.getFormValues(type);
    let unitCosts: number = values[0];
    let annualUsage: number = values[1];
    let annualCosts: number = values[2];
    let capitalized: string = values[3];
    if (value == 'unit_costs'){
      if (!annualUsage || !annualCosts){
        this[('formNotFilledError' + capitalized + 'UnitCosts')] = true;
        this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualCosts')] = false;
      }
      else {
        this[('formNotFilledError' + capitalized + 'UnitCosts')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualCosts')] = false;
        if (type == 'wastewater') {
          this.settings.waterWasteCost = annualCosts/annualUsage;
        }
        else if (type == 'naturalGas'){
          this.settings.fuelCost = annualCosts/annualUsage;
        }
        else {       
          this.settings[(type + 'Cost')] = annualCosts/annualUsage;
        }
      }
    }
    if (value == 'annual_consumption'){
      if (!unitCosts || !annualCosts){
        this[('formNotFilledError' + capitalized + 'UnitCosts')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = true;
        this[('formNotFilledError' + capitalized + 'AnnualCosts')] = false;
      }
      else {
        this[('formNotFilledError' + capitalized + 'UnitCosts')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualCosts')] = false;        
        if (type == 'wastewater') {
          this.treasureHunt.currentEnergyUsage.wasteWaterUsage = annualCosts/unitCosts;
        }
        else {
          this.treasureHunt.currentEnergyUsage[(type + 'Usage')] = annualCosts/unitCosts;
        }
      }
    }
    if (value == 'annual_costs'){
      if (!unitCosts || !annualUsage){
        this[('formNotFilledError' + capitalized + 'UnitCosts')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualCosts')] = true;
      }
      else {
        this[('formNotFilledError' + capitalized + 'UnitCosts')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = false;
        this[('formNotFilledError' + capitalized + 'AnnualCosts')] = false;
        if (type == 'wastewater') {
          this.treasureHunt.currentEnergyUsage.wasteWaterCosts = unitCosts * annualUsage;
        }
        else {
          this.treasureHunt.currentEnergyUsage[(type + 'Costs')] = unitCosts*annualUsage;
        }
      }
    }
    this.save();
  }

  checkForm(type: string){
    const values: [number, number, number, string] = this.getFormValues(type);
    let unitCosts: number = values[0];
    let annualUsage: number = values[1];
    let annualCosts: number = values[2];
    let capitalized: string = values[3];
    if (unitCosts && annualUsage){
      this[('formNotFilledError' + capitalized + 'AnnualCosts')] = false;    
    }
    if (unitCosts && annualCosts){
      this[('formNotFilledError' + capitalized + 'AnnualConsumption')] = false;
    }
    if (annualUsage && annualCosts){
      this[('formNotFilledError' + capitalized + 'UnitCosts')] = false;
    }

    this.save();
  }

  updateErrorText(type: string, value: string, clickedButton?: boolean){
    const values: [number, number, number, string] = this.getFormValues(type);
    let unitCosts: number = values[0];
    let annualUsage: number = values[1];
    let annualCosts: number = values[2];
    let capitalized: string = values[3];
    if (type == 'naturalGas'){
      capitalized = 'Natural Gas';
    }
    if (type == 'otherFuel'){
      capitalized = 'Other Fuel';
    }
    if (type == 'compressedAir'){
      capitalized = 'Compressed Air';
    }
    if (!clickedButton && this[(type + 'FormErrorText')] && this.currentError)
    {
      value = this.currentError;
    }
    this.currentError = value;
    if (value == 'unit_costs'){
      if (!annualUsage || !annualCosts){
        this[(type + 'FormErrorText')] = '';
        if (!annualUsage)
        {
          this[(type + 'FormErrorText')] += (capitalized + ' Annual Consumption');
        }
        if (!annualUsage && !annualCosts){
          this[(type + 'FormErrorText')] += (' & ')
        }
        if (!annualCosts)
        {
          this[(type + 'FormErrorText')] += (capitalized + ' Annual Costs');
        }
      }
    }
    else if (value == 'annual_consumption'){
      if (!unitCosts || !annualCosts){
        this[(type + 'FormErrorText')] = '';
        if (!unitCosts)
        {
          this[(type + 'FormErrorText')] += (capitalized + ' Unit Cost');
        }
        if (!unitCosts && !annualCosts){
          this[(type + 'FormErrorText')] += (' & ')
        }
        if (!annualCosts)
        {
          this[(type + 'FormErrorText')] += (capitalized + ' Annual Costs');
        }
      }
    }
    else if (value == 'annual_costs'){
      if (!unitCosts || !annualUsage){
        this[(type + 'FormErrorText')] = '';
        if (!unitCosts)
        {
          this[(type + 'FormErrorText')] += (capitalized + ' Unit Cost');
        }
        if (!unitCosts && !annualUsage){
          this[(type + 'FormErrorText')] += (' & ')
        }
        if (!annualUsage)
        {
          this[(type + 'FormErrorText')] += (capitalized + ' Annual Consumption');
        }
      }
    }
  }

}
