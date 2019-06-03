import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreasureHunt, OpportunitySheetResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunitySheetService } from '../../standalone-opportunity-sheet/opportunity-sheet.service';
import * as _ from 'lodash';
import { OpportunitySummaryService } from '../../treasure-hunt-report/opportunity-summary.service';

@Component({
  selector: 'app-treasure-chest-menu',
  templateUrl: './treasure-chest-menu.component.html',
  styleUrls: ['./treasure-chest-menu.component.css']
})
export class TreasureChestMenuComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  settings: Settings;

  @Output('emitChangeEnergyType')
  emitChangeEnergyType = new EventEmitter<string>();
  @Output('emitChangeCalculatorType')
  emitChangeCalculatorType = new EventEmitter<string>();

  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';

  energyTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  calculatorTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  constructor(private opportunitySheetService: OpportunitySheetService) { }

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
    let numCalcs = _.sumBy(this.energyTypeOptions, (option) => { return option.numCalcs });

    this.energyTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
    this.calculatorTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
  }

  setCalculatorOptions() {
    this.calculatorTypeOptions = new Array();
    let numCalcs: number = 0;
    //electricity
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Electricity') {
      numCalcs = numCalcs + this.setElectricityCalcs();
    }
    //natural gas
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Natural Gas') {
      numCalcs = numCalcs + this.setNaturalGas();
    }
    // water
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Water') {
      numCalcs = numCalcs + this.setWater();
    }
    // wasteWater
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Waste Water') {
      numCalcs = numCalcs + this.setWasteWater();
    }
    // otherFuel
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Other Fuel') {
      numCalcs = numCalcs + this.setOtherFuel();
    }
    // compressedAir
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Compressed Air') {
      numCalcs = numCalcs + this.setCompressedAir();
    }
    // steam
    if (this.displayEnergyType == 'All' || this.displayEnergyType == 'Steam') {
      numCalcs = numCalcs + this.setSteam();
    }

    //set opp sheet option
    this.setOppSheetOption();


    this.calculatorTypeOptions.unshift({ value: 'All', numCalcs: numCalcs });
  }

  setOppSheetOption() {
    if (this.treasureHunt.opportunitySheets.length && this.treasureHunt.opportunitySheets.length != 0) {
      // let numCalcs: number = this.treasureHunt.opportunitySheets.length;
      // if (this.displayEnergyType != 'All') {
      //   let summaries = this.opportunitySummaryService.getOpportunitySheetSummaries(this.treasureHunt.opportunitySheets, new Array(), this.settings, true);
      //   let filteredItems = _.filter(summaries, (summary) => {
      //     return summary.utilityType == this.displayEnergyType;
      //   })
      //   numCalcs = filteredItems.length;
      // }
      this.calculatorTypeOptions.push({ value: 'Opportunity Sheet', numCalcs: undefined });
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
