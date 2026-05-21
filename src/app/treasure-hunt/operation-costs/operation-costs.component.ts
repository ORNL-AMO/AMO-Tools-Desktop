import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, inject, Signal } from '@angular/core';
import { TreasureHunt, TreasureHuntResults, EnergyUsage } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';
import { Subscription } from 'rxjs';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { OtherFuel, otherFuels } from '../../calculator/utilities/co2-savings/co2-savings-form/co2FuelSavingsFuels';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { TreasureHuntReportService } from '../treasure-hunt-report/treasure-hunt-report.service';


@Component({
  selector: 'app-operation-costs',
  templateUrl: './operation-costs.component.html',
  styleUrls: ['./operation-costs.component.css'],
  standalone: false
})
export class OperationCostsComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  private treasureHuntService = inject(TreasureHuntService);
  private convertUnitsService = inject(ConvertUnitsService);
  private assessmentCo2SavingsService = inject(AssessmentCo2SavingsService);
  private treasureHuntReportService = inject(TreasureHuntReportService);

  @Input()
  settings: Settings;
  @Input()
  treasureHunt: TreasureHunt;
  
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
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
  
  mixedCO2Emissions: number;
  usingMixedCO2: boolean;
  formWidth: number;
  bodyHeight: number;
  co2SavingsData: Co2SavingsData;
  otherFuelEnergySources: Array<OtherFuel> = otherFuels;
  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;
  electricityModalShown: boolean = false;
  naturalGasEmissionsShown: boolean = false;
  treasureHuntResults: TreasureHuntResults;

  hasUtilityTypeOpportunity: {
    electricity: boolean,
    naturalGas: boolean,
    otherFuel: boolean,
    water: boolean,
    wasteWater: boolean,
    compressedAir: boolean,
    steam: boolean
  } = {
    electricity: false,
    naturalGas: false,
    otherFuel: false,
    water: false,
    wasteWater: false,
    compressedAir: false,
    steam: false
  };

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
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

  
  saveTreasureHunt() {
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
  }

  saveSettings() {
    this.treasureHuntService.setTreasureHuntSettings(this.settings);
  }

  initForm() {
    this.setDefaultCo2SavingsData(this.settings);

    this.co2SavingsData = this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData;
    this.setFuelOptions();
    this.checkIsUsingMixedFuel();
    this.setHasUtilityTypeOpportunity();
    this.setUtilityTypeIsUsed();
  }

  setDefaultCo2SavingsData(settings: Settings) {
    if (!this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData) {
      this.treasureHunt.currentEnergyUsage.electricityCO2SavingsData = this.assessmentCo2SavingsService.getDefaultElectricityCO2Data(settings);
    }
    if (!this.treasureHunt.currentEnergyUsage.naturalGasCO2SavingsData) {
      this.treasureHunt.currentEnergyUsage.naturalGasCO2SavingsData = this.assessmentCo2SavingsService.getDefaultNaturalGasCO2Data();
    }
    if (!this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData) {
      this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData = this.assessmentCo2SavingsService.getDefaultOtherFuelCO2Data();
    }
  }

  setUtilityTypeIsUsed() {
    if (this.hasUtilityTypeOpportunity.electricity && !this.treasureHunt.currentEnergyUsage.electricityUsed) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = true;
    }
    if (this.hasUtilityTypeOpportunity.naturalGas && !this.treasureHunt.currentEnergyUsage.naturalGasUsed) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = true;
    }
    if (this.hasUtilityTypeOpportunity.otherFuel && !this.treasureHunt.currentEnergyUsage.otherFuelUsed) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = true;
    }
    if (this.hasUtilityTypeOpportunity.water && !this.treasureHunt.currentEnergyUsage.waterUsed) {
      this.treasureHunt.currentEnergyUsage.waterUsed = true;
    }
    if (this.hasUtilityTypeOpportunity.wasteWater && !this.treasureHunt.currentEnergyUsage.wasteWaterUsed) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = true;
    }
    if (this.hasUtilityTypeOpportunity.compressedAir && !this.treasureHunt.currentEnergyUsage.compressedAirUsed) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = true;
    }
    if (this.hasUtilityTypeOpportunity.steam && !this.treasureHunt.currentEnergyUsage.steamUsed) {
      this.treasureHunt.currentEnergyUsage.steamUsed = true;
    }
  }


  /**
   * Check utility types in use. If an opportunity is using an enabled utility type, it must stay enabled. 
   * Currently, checking the result energy usage is the closest available method to matching opportunities in use to utility types
   * 
   */
  setHasUtilityTypeOpportunity() {
    // todo below should be replaced with a more effective way to check utility types in use (i.e. looking at opportunity summaries 'type' or opportunity sheets utilitytype)

    this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.treasureHunt, this.settings);

    // * treasureHuntResults.electricity.baselineEneryUse can't be used because it's built from treasureHunt.currentEnergyUse and will persist when all opps are deleted
    if (this.treasureHuntResults?.electricity.energySavings) {
      this.hasUtilityTypeOpportunity.electricity = true;
    }
    if (this.treasureHuntResults?.naturalGas.energySavings) {
      this.hasUtilityTypeOpportunity.naturalGas = true;
    }
    if (this.treasureHuntResults?.otherFuel.energySavings) {
      this.hasUtilityTypeOpportunity.otherFuel = true;
    }
    if (this.treasureHuntResults?.water.energySavings) {
      this.hasUtilityTypeOpportunity.water = true;
    }
    if (this.treasureHuntResults?.wasteWater.energySavings) {
      this.hasUtilityTypeOpportunity.wasteWater = true;
    }
    if (this.treasureHuntResults?.compressedAir.energySavings) {
      this.hasUtilityTypeOpportunity.compressedAir = true;
    }
    if (this.treasureHuntResults?.steam.energySavings) {
      this.hasUtilityTypeOpportunity.steam = true;
    }

    // todo this requires 8351
    // let energyItemTypes: Set<string> = new Set<string>();
    // Ex
    // A
    // Object.values(this.treasureHunt).forEach(treasureHuntProperty => {
    //   if (!Array.isArray(treasureHuntProperty)) return;
    //   (treasureHuntProperty as Array<any>).forEach(opportunity => {
    //     //  When should we take from the baselineEnergyUseItems and when should we take from the opportunitySheet baselineEnergyUseItems?
    //     const items: Array<EnergyUseItem> = opportunity.baselineEnergyUseItems ?? opportunity.opportunitySheet?.baselineEnergyUseItems;
    //     if (items) {
    //       items.forEach(item => energyItemTypes.add(item.type));
    //     }
    //   });
    // });

    // OR B
    // let opportunitySummaries: Array<OpportunitySummary> = this.opportunitySummaryService.getOpportunitySummaries(this.treasureHunt, this.settings);
    //   opportunitySummaries.forEach(summary => {
    //     if (summary.utilityType) {
    //       energyItemTypes.add(summary.utilityType);
    //     }
    //   });


    // console.log('Energy Item Types:', energyItemTypes);
    // this.hasUtilityTypeOpportunity.electricity = energyItemTypes.has('Electricity');
    // this.hasUtilityTypeOpportunity.naturalGas = energyItemTypes.has('Gas');
    // this.hasUtilityTypeOpportunity.otherFuel = energyItemTypes.has('Other Fuel');
    // this.hasUtilityTypeOpportunity.water = energyItemTypes.has('Water');
    // this.hasUtilityTypeOpportunity.wasteWater = energyItemTypes.has('WWT');
    // this.hasUtilityTypeOpportunity.compressedAir = energyItemTypes.has('Compressed Air');
    // this.hasUtilityTypeOpportunity.steam = energyItemTypes.has('Steam');
    
  }

  // * toggle handlers preventatively reset usage/cost levels to keep legacy functionality. Unsure if this could cause issues where an opportunity has a side-effect utility type, 
  // * i.e. the opportunity visilibity is enabled by 'Water' but also has 'Electricity' energy use items 
  toggleElectricityUsed() {
    if (this.hasUtilityTypeOpportunity.electricity) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.electricityUsed = !this.treasureHunt.currentEnergyUsage.electricityUsed;
    if (!this.treasureHunt.currentEnergyUsage.electricityUsed) {
      this.treasureHunt.currentEnergyUsage.electricityUsage = 0;
      this.treasureHunt.currentEnergyUsage.electricityCosts = 0;
    }
    this.saveTreasureHunt();
  }
  toggleNaturalGasUsed() {
    if (this.hasUtilityTypeOpportunity.naturalGas) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.naturalGasUsed = !this.treasureHunt.currentEnergyUsage.naturalGasUsed;
    if (!this.treasureHunt.currentEnergyUsage.naturalGasUsed) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsage = 0;
      this.treasureHunt.currentEnergyUsage.naturalGasCosts = 0;
    }
    this.saveTreasureHunt();
  }
  toggleOtherFuelUsed() {
    if (this.hasUtilityTypeOpportunity.otherFuel) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.otherFuelUsed = !this.treasureHunt.currentEnergyUsage.otherFuelUsed;
    if (!this.treasureHunt.currentEnergyUsage.otherFuelUsed) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsage = 0;
      this.treasureHunt.currentEnergyUsage.otherFuelCosts = 0;
    }
    this.saveTreasureHunt();
  }
  toggleWaterUsed() {
    if (this.hasUtilityTypeOpportunity.water) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.waterUsed = !this.treasureHunt.currentEnergyUsage.waterUsed;
    if (!this.treasureHunt.currentEnergyUsage.waterUsed) {
      this.treasureHunt.currentEnergyUsage.waterUsage = 0;
      this.treasureHunt.currentEnergyUsage.waterCosts = 0;
    }
    this.saveTreasureHunt();
  }
  toggleWasteWaterUsed() {
    if (this.hasUtilityTypeOpportunity.wasteWater) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.wasteWaterUsed = !this.treasureHunt.currentEnergyUsage.wasteWaterUsed;
    if (!this.treasureHunt.currentEnergyUsage.wasteWaterUsed) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsage = 0;
      this.treasureHunt.currentEnergyUsage.wasteWaterCosts = 0;
    }
    this.saveTreasureHunt();
  }
  toggleCompressedAirUsed() {
    if (this.hasUtilityTypeOpportunity.compressedAir) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.compressedAirUsed = !this.treasureHunt.currentEnergyUsage.compressedAirUsed;
    if (!this.treasureHunt.currentEnergyUsage.compressedAirUsed) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsage = 0;
      this.treasureHunt.currentEnergyUsage.compressedAirCosts = 0;
    }
    this.saveTreasureHunt();
  }

  toggleSteamUsed() {
    if (this.hasUtilityTypeOpportunity.steam) {
      return;
    }
    this.treasureHunt.currentEnergyUsage.steamUsed = !this.treasureHunt.currentEnergyUsage.steamUsed;
    if (!this.treasureHunt.currentEnergyUsage.steamUsed) {
      this.treasureHunt.currentEnergyUsage.steamUsage = 0;
      this.treasureHunt.currentEnergyUsage.steamCosts = 0;
    }
    this.saveTreasureHunt();
  }

  checkIsUsingMixedFuel() {
    if (this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.energySource == 'Mixed Fuels') {
      this.usingMixedCO2 = true;
    } else {
      this.usingMixedCO2 = false;
    }
  }

  setFuelOptions() {
    let tmpOtherFuel: OtherFuel = this.otherFuelEnergySources.find(val => val.energySource === this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.energySource);
    this.fuelOptions = tmpOtherFuel.fuelTypes;
  }

  setEnergySource() {
    this.setFuelOptions();
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.fuelType = this.fuelOptions[0].fuelType;
    let outputRate: number = this.fuelOptions[0].outputRate;
    if (this.settings.unitsOfMeasure !== 'Imperial') {
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(2));
    }
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = outputRate;
    this.checkIsUsingMixedFuel();
    this.saveTreasureHunt();
  }

  setFuel() {
    let tmpFuel: { fuelType: string, outputRate: number } = this.fuelOptions.find(val => val.fuelType === this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.fuelType);
    let outputRate: number = tmpFuel.outputRate;
    if (this.settings.unitsOfMeasure !== 'Imperial') {
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(2));
    }
    this.treasureHunt.currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate = outputRate;
    this.saveTreasureHunt();
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
    this.saveTreasureHunt();
    this.treasureHuntService.modalOpen.next(false);
    this.zipCodeModal.hide();
  }

  updateElectricityCo2SavingsData(co2SavingsData?: Co2SavingsData) {
    this.co2SavingsData = co2SavingsData;
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
    this.saveTreasureHunt();
    this.treasureHuntService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
  }

  saveOtherFuelsMixedList(mixedFuelsList: Array<Co2SavingsData>) {
    this.treasureHunt.currentEnergyUsage.otherFuelMixedCO2SavingsData = mixedFuelsList;
    this.saveTreasureHunt();
  }

  calculateElectricityUnitCosts() {
    this.calcUnitCost('electricityCost', this.treasureHunt.currentEnergyUsage.electricityCosts, this.treasureHunt.currentEnergyUsage.electricityUsage);
  }
  calculateElectricityAnnualConsumption() {
    this.calcAnnualConsumption('electricityUsage', this.treasureHunt.currentEnergyUsage.electricityCosts, this.settings.electricityCost);
  }
  calculateElectricityAnnualCosts() {
    this.calcAnnualCosts('electricityCosts', this.treasureHunt.currentEnergyUsage.electricityUsage, this.settings.electricityCost);
  }

  calculateNaturalGasUnitCosts() {
    this.calcUnitCost('fuelCost', this.treasureHunt.currentEnergyUsage.naturalGasCosts, this.treasureHunt.currentEnergyUsage.naturalGasUsage);
  }
  calculateNaturalGasAnnualConsumption() {
    this.calcAnnualConsumption('naturalGasUsage', this.treasureHunt.currentEnergyUsage.naturalGasCosts, this.settings.fuelCost);
  }
  calculateNaturalGasAnnualCosts() {
    this.calcAnnualCosts('naturalGasCosts', this.treasureHunt.currentEnergyUsage.naturalGasUsage, this.settings.fuelCost);
  }

  calculateOtherFuelUnitCosts() {
    this.calcUnitCost('otherFuelCost', this.treasureHunt.currentEnergyUsage.otherFuelCosts, this.treasureHunt.currentEnergyUsage.otherFuelUsage);
  }
  calculateOtherFuelAnnualConsumption() {
    this.calcAnnualConsumption('otherFuelUsage', this.treasureHunt.currentEnergyUsage.otherFuelCosts, this.settings.otherFuelCost);
  }
  calculateOtherFuelAnnualCosts() {
    this.calcAnnualCosts('otherFuelCosts', this.treasureHunt.currentEnergyUsage.otherFuelUsage, this.settings.otherFuelCost);
  }

  calculateWaterUnitCosts() {
    this.calcUnitCost('waterCost', this.treasureHunt.currentEnergyUsage.waterCosts, this.treasureHunt.currentEnergyUsage.waterUsage, 'kgal', 'gal');
  }
  calculateWaterAnnualConsumption() {
    this.calcAnnualConsumption('waterUsage', this.treasureHunt.currentEnergyUsage.waterCosts, this.settings.waterCost, 'gal', 'kgal');
  }
  calculateWaterAnnualCosts() {
    this.calcAnnualCosts('waterCosts', this.treasureHunt.currentEnergyUsage.waterUsage, this.settings.waterCost, 'kgal', 'gal');
  }

  calculateWastewaterUnitCosts() {
    this.calcUnitCost('waterWasteCost', this.treasureHunt.currentEnergyUsage.wasteWaterCosts, this.treasureHunt.currentEnergyUsage.wasteWaterUsage, 'kgal', 'gal');
  }
  calculateWastewaterAnnualConsumption() {
    this.calcAnnualConsumption('wasteWaterUsage', this.treasureHunt.currentEnergyUsage.wasteWaterCosts, this.settings.waterWasteCost, 'gal', 'kgal');
  }
  calculateWastewaterAnnualCosts() {
    this.calcAnnualCosts('wasteWaterCosts', this.treasureHunt.currentEnergyUsage.wasteWaterUsage, this.settings.waterWasteCost, 'kgal', 'gal');
  }

  calculateCompressedAirUnitCosts() {
    this.calcUnitCost('compressedAirCost', this.treasureHunt.currentEnergyUsage.compressedAirCosts, this.treasureHunt.currentEnergyUsage.compressedAirUsage, 'kscf', 'ft3');
  }
  calculateCompressedAirAnnualConsumption() {
    this.calcAnnualConsumption('compressedAirUsage', this.treasureHunt.currentEnergyUsage.compressedAirCosts, this.settings.compressedAirCost, 'ft3', 'kscf');
  }
  calculateCompressedAirAnnualCosts() {
    this.calcAnnualCosts('compressedAirCosts', this.treasureHunt.currentEnergyUsage.compressedAirUsage, this.settings.compressedAirCost, 'kscf', 'ft3');
  }

  calculateSteamUnitCosts() {
    this.calcUnitCost('steamCost', this.treasureHunt.currentEnergyUsage.steamCosts, this.treasureHunt.currentEnergyUsage.steamUsage);
  }
  calculateSteamAnnualConsumption() {
    this.calcAnnualConsumption('steamUsage', this.treasureHunt.currentEnergyUsage.steamCosts, this.settings.steamCost);
  }
  calculateSteamAnnualCosts() {
    this.calcAnnualCosts('steamCosts', this.treasureHunt.currentEnergyUsage.steamUsage, this.settings.steamCost);
  }

  // * re: conversions for below calculations - usage/cost units only differ for imperial units
  private calcUnitCost(
    settingsCostKey: keyof Settings,
    costs: number, 
    usage: number,
    imperialUsageUnit?: string, 
    imperialCostUnit?: string
  ) {
    let utilityTypeUsage = usage;
    if (imperialUsageUnit && imperialCostUnit && this.settings.unitsOfMeasure === 'Imperial') {
      utilityTypeUsage = this.convertUnitsService.value(usage).from(imperialUsageUnit).to(imperialCostUnit);
    }

    // * as any because Settings has mixed property types
    (this.settings as any)[settingsCostKey] = costs / utilityTypeUsage;
    this.saveTreasureHunt();
    this.saveSettings();
  }

  private calcAnnualConsumption(
    usageKey: keyof EnergyUsage,
    costs: number, 
    unitCost: number,
    imperialCostUnit?: string, 
    imperialUsageUnit?: string
  ) {
    let usage = costs / unitCost;
    if (imperialCostUnit && imperialUsageUnit && this.settings.unitsOfMeasure === 'Imperial') {
      usage = this.convertUnitsService.value(usage).from(imperialCostUnit).to(imperialUsageUnit);
    }

    // * as any because EnergyUsage has mixed property types
    (this.treasureHunt.currentEnergyUsage as any)[usageKey] = usage;
    this.saveTreasureHunt();
  }

  private calcAnnualCosts(
    costsKey: keyof EnergyUsage,
    usage: number, 
    unitCost: number,
    imperialUsageUnit?: string, 
    imperialCostUnit?: string
  ) {
    let utilityTypeUsage = usage;
    if (imperialUsageUnit && imperialCostUnit && this.settings.unitsOfMeasure === 'Imperial') {
      utilityTypeUsage = this.convertUnitsService.value(usage).from(imperialUsageUnit).to(imperialCostUnit);
    }

    // * as any because EnergyUsage has mixed property types
    (this.treasureHunt.currentEnergyUsage as any)[costsKey] = utilityTypeUsage * unitCost;
    this.saveTreasureHunt();
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


}
