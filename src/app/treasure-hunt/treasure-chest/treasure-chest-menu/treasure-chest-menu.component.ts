import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TreasureHunt, OpportunitySheetResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunitySheetService } from '../../calculators/standalone-opportunity-sheet/opportunity-sheet.service';
import * as _ from 'lodash';
import { OpportunitySummaryService } from '../../treasure-hunt-report/opportunity-summary.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';

@Component({
  selector: 'app-treasure-chest-menu',
  templateUrl: './treasure-chest-menu.component.html',
  styleUrls: ['./treasure-chest-menu.component.css']
})
export class TreasureChestMenuComponent implements OnInit {

  @Input()
  settings: Settings;
  @Output('emitImportExport')
  emitImportExport = new EventEmitter<boolean>();
  @Output('emitChangeEnergyType')
  emitChangeEnergyType = new EventEmitter<string>();
  @Output('emitChangeCalculatorType')
  emitChangeCalculatorType = new EventEmitter<string>();
  @ViewChild('navbar') navbar: ElementRef;

  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';

  energyTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  calculatorTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  treasureHuntSub: Subscription;

  displayUtilityTypeDropdown: boolean = false;
  displayCalculatorTypeDropdown: boolean = false;
  displayAdditionalFiltersDropdown: boolean = false;
  sortByDropdown: boolean = false;
  navbarWidth: number;
  treasureHunt: TreasureHunt;
  sortBy: string;
  sortBySub: Subscription;
  sortByLabel: string;
  constructor(private treasureChestMenuService: TreasureChestMenuService, private opportunitySheetService: OpportunitySheetService, private opportunitySummaryService: OpportunitySummaryService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.energyTypeOptions = new Array();
      this.calculatorTypeOptions = new Array();
      this.setEnergyTypeOptions();
    });
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortBy = val;
      this.getSortByLabel();
    })
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
    this.sortBySub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getNavbarWidth();
  }

  selectAll() {
    this.treasureChestMenuService.selectAll.next(true);
    this.treasureChestMenuService.selectAll.next(false);
  }

  setSortBy(str: string) {
    this.treasureChestMenuService.sortBy.next(str);
    this.toggleSortBy();
  }

  getSortByLabel() {
    if (this.sortBy == 'annualCostSavings') {
      this.sortByLabel = 'Annual Savings';
    } else if (this.sortBy == 'annualEnergySavings') {
      this.sortByLabel = 'Annual Energy Savings';
    } else if (this.sortBy == 'team') {
      this.sortByLabel = 'Team';
    } else if (this.sortBy == 'name') {
      this.sortByLabel = 'Name';
    } else if (this.sortBy == 'implementationCost') {
      this.sortByLabel = 'Implementation Cost';
    } else if (this.sortBy == 'paybackPeriod') {
      this.sortByLabel = 'Payback Period';
    }
  }

  toggleUtilityType() {
    this.displayUtilityTypeDropdown = !this.displayUtilityTypeDropdown;
  }

  toggleCalculatorType() {
    this.displayCalculatorTypeDropdown = !this.displayCalculatorTypeDropdown;
  }

  toggleAdditionalFilters() {
    this.displayAdditionalFiltersDropdown = !this.displayAdditionalFiltersDropdown;
  }

  toggleSortBy() {
    this.sortByDropdown = !this.sortByDropdown;
  }

  getNavbarWidth() {
    if (this.navbar) {
      setTimeout(() => {
        this.navbarWidth = this.navbar.nativeElement.clientWidth * .95;
      }, 100);
    }
  }

  showImportExport() {
    this.emitImportExport.emit(true);
  }

  setEnergyType(str: string) {
    this.displayEnergyType = str;
    this.displayCalculatorType = 'All';
    this.setCalculatorType('All');
    this.emitChangeEnergyType.emit(this.displayEnergyType);
    this.setCalculatorOptions();
  }

  getNumberOfCalcs() {
    let numCalcs: number = 0;
    if (this.treasureHunt.opportunitySheets) {
      numCalcs = numCalcs + this.getNumberOfOppSheetCalcs();
    }
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Electricity') {
      numCalcs = numCalcs + this.getNumberOfElectricityCalcs();
    }
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Natural Gas') {
      numCalcs = numCalcs + this.getNumberOfNaturalGasCalcs();
    }
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Compressed Air') {
      numCalcs = numCalcs + this.getNumberOfCompressedAirCalcs();
    }
    //add getNumberUtilities once additional calcs are added for other utilities.
    return numCalcs;
  }

  getNumberOfElectricityCalcs(): number {
    let numElectricity: number = 0;
    if (this.treasureHunt.lightingReplacements && this.treasureHunt.lightingReplacements.length != 0) {
      numElectricity = this.treasureHunt.lightingReplacements.length;
    }
    if (this.treasureHunt.motorDrives && this.treasureHunt.motorDrives.length != 0) {
      numElectricity = numElectricity + this.treasureHunt.motorDrives.length;
    }
    if (this.treasureHunt.replaceExistingMotors && this.treasureHunt.replaceExistingMotors.length != 0) {
      numElectricity = numElectricity + this.treasureHunt.replaceExistingMotors.length;
    }
    if (this.treasureHunt.electricityReductions && this.treasureHunt.electricityReductions.length != 0) {
      numElectricity = numElectricity + this.treasureHunt.electricityReductions.length;
    }

    if (this.treasureHunt.compressedAirReductions && this.treasureHunt.compressedAirReductions.length != 0) {
      this.treasureHunt.compressedAirReductions.forEach(reduction => {
        if (reduction.baseline[0].utilityType == 1) {
          numElectricity++;
        }
      })
    }
    return numElectricity;
  }

  getNumberOfNaturalGasCalcs(): number {
    let numGas: number = 0;
    if (this.treasureHunt.naturalGasReductions && this.treasureHunt.naturalGasReductions.length != 0) {
      numGas = numGas + this.treasureHunt.naturalGasReductions.length;
    }
    return numGas;
  }

  getNumberOfCompressedAirCalcs(): number {
    let numCompressedAir: number = 0;
    if (this.treasureHunt.compressedAirReductions && this.treasureHunt.compressedAirReductions.length != 0) {
      this.treasureHunt.compressedAirReductions.forEach(reduction => {
        if (reduction.baseline[0].utilityType == 0) {
          numCompressedAir++;
        }
      })
    }
    return numCompressedAir;
  }

  getNumberOfOppSheetCalcs(): number {
    if (this.treasureHunt.opportunitySheets) {
      let numCalcs: number = this.treasureHunt.opportunitySheets.length;
      if (this.displayEnergyType != 'All') {
        let summaries = this.opportunitySummaryService.getOpportunitySheetSummaries(this.treasureHunt.opportunitySheets, new Array(), this.settings, true);
        let filteredItems = _.filter(summaries, (summary) => {
          if (summary.utilityType == this.displayEnergyType) {
            return summary
          } else if (summary.utilityType == 'Mixed' && summary.mixedIndividualResults) {
            let filteredMixedItems = _.filter(summary.mixedIndividualResults, (mixedSummary) => { return mixedSummary.utilityType == this.displayEnergyType });
            if (filteredMixedItems.length != 0) {
              return summary;
            }
          }
        })
        numCalcs = filteredItems.length;
      }
      return numCalcs;
    } else {
      return 0;
    }
  }

  setCalculatorType(str: string) {
    this.displayCalculatorType = str;
    this.emitChangeCalculatorType.emit(this.displayCalculatorType);
  }

  setEnergyTypeOptions() {
    let numSteam: number = this.setSteam();
    let numElectricity: number = this.setElectricityCalcs();
    let numNaturalGas: number = this.setNaturalGas();
    let numWater: number = this.setWater();
    let numWasteWater: number = this.setWasteWater();
    let numOtherFuel: number = this.setOtherFuel();
    let numCompressedAir: number = this.setCompressedAir();

    //electricity
    if (numElectricity != 0) {
      this.energyTypeOptions.push({ value: 'Electricity', numCalcs: numElectricity });
    }
    // naturalGas
    if (numNaturalGas != 0) {
      this.energyTypeOptions.push({ value: 'Natural Gas', numCalcs: numNaturalGas });
    }
    // water
    if (numWater != 0) {
      this.energyTypeOptions.push({ value: 'Water', numCalcs: numWater });
    }
    // wasteWater
    if (numWasteWater != 0) {
      this.energyTypeOptions.push({ value: 'Waste Water', numCalcs: numWasteWater });
    }
    // otherFuel
    if (numOtherFuel != 0) {
      this.energyTypeOptions.push({ value: 'Other Fuel', numCalcs: numOtherFuel });
    }
    // compressedAir
    if (numCompressedAir != 0) {
      this.energyTypeOptions.push({ value: 'Compressed Air', numCalcs: numCompressedAir });
    }
    // steam
    if (numSteam != 0) {
      this.energyTypeOptions.push({ value: 'Steam', numCalcs: numSteam });
    }
    //set opp sheet option
    this.setOppSheetOption();
    let numCalcs = this.getNumberOfCalcs();

    this.energyTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
    this.calculatorTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
  }

  setCalculatorOptions() {
    this.calculatorTypeOptions = new Array();
    //electricity
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Electricity') {
      this.setElectricityCalcs();
    }
    //natural gas
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Natural Gas') {
      this.setNaturalGas();
    }
    // water
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Water') {
      this.setWater();
    }
    // wasteWater
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Waste Water') {
      this.setWasteWater();
    }
    // otherFuel
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Other Fuel') {
      this.setOtherFuel();
    }
    // compressedAir
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Compressed Air') {
      this.setCompressedAir();
    }
    // steam
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Steam') {
      this.setSteam();
    }

    //set opp sheet option
    this.setOppSheetOption();

    let numCalcs: number = this.getNumberOfCalcs();
    this.calculatorTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
  }

  setOppSheetOption() {
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      let numCalcs: number = this.getNumberOfOppSheetCalcs();
      if (numCalcs != 0) {
        this.calculatorTypeOptions.push({ value: 'Opportunity Sheet', numCalcs: numCalcs });
      }
    }
  }

  setElectricityCalcs(): number {
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

    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.electricityResults.energyCostSavings > 0) {
          numElectricity++;
        }
      })
    }

    if (this.treasureHunt.compressedAirReductions && this.treasureHunt.compressedAirReductions.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Compressed Air Reduction', numCalcs: this.treasureHunt.compressedAirReductions.length });
      this.treasureHunt.compressedAirReductions.forEach(reduction => {
        if (reduction.baseline[0].utilityType == 1) {
          numElectricity++;
        }
      })
    }
    return numElectricity;
  }

  setNaturalGas(): number {
    let numGas: number = 0;
    if (this.treasureHunt.naturalGasReductions && this.treasureHunt.naturalGasReductions.length != 0) {
      this.calculatorTypeOptions.push({ value: 'Natural Gas Reduction', numCalcs: this.treasureHunt.naturalGasReductions.length });
      numGas = numGas + this.treasureHunt.naturalGasReductions.length;
    }
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.gasResults.energyCostSavings > 0) {
          numGas++;
        }
      })
    }
    return numGas;
  }

  setWater(): number {
    let numGas: number = 0;
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.waterResults.energyCostSavings > 0) {
          numGas++;
        }
      })
    }
    return numGas;
  }

  setCompressedAir(): number {
    let numCompressedAir: number = 0;
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.compressedAirResults.energyCostSavings > 0) {
          numCompressedAir++;
        }
      })
    }
    if (this.treasureHunt.compressedAirReductions && this.treasureHunt.compressedAirReductions.length != 0) {
      //this.calculatorTypeOptions.push({value: 'Compressed Air Reduction', numCalcs: this.treasureHunt.compressedAirReductions.length});
      this.treasureHunt.compressedAirReductions.forEach(reduction => {
        if (reduction.baseline[0].utilityType == 0) {
          numCompressedAir++;
        }
      })
    }
    return numCompressedAir;
  }

  setWasteWater(): number {
    let numWasteWater: number = 0;
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.wasteWaterResults.energyCostSavings > 0) {
          numWasteWater++;
        }
      })
    }
    return numWasteWater;
  }

  setOtherFuel(): number {
    let numOtherFuel: number = 0;
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.otherFuelResults.energyCostSavings > 0) {
          numOtherFuel++;
        }
      })
    }
    return numOtherFuel;
  }

  setSteam(): number {
    let numSteam: number = 0;
    if (this.treasureHunt.opportunitySheets && this.treasureHunt.opportunitySheets.length != 0) {
      this.treasureHunt.opportunitySheets.forEach(sheet => {
        let results: OpportunitySheetResults = this.opportunitySheetService.getResults(sheet, this.settings);
        if (results.steamResults.energyCostSavings > 0) {
          numSteam++;
        }
      })
    }
    return numSteam;
  }
}
