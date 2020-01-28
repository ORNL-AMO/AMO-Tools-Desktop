import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-treasure-chest-menu',
  templateUrl: './treasure-chest-menu.component.html',
  styleUrls: ['./treasure-chest-menu.component.css'],
  animations: [
    trigger('menuModal', [
      state('show', style({
        top: '20px',
        bottom: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class TreasureChestMenuComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('navbar', { static: false }) navbar: ElementRef;
  navbarWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getNavbarWidth();
  }



  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';

  energyTypeOptions: Array<{ value: string, numCalcs: number }> = [];
  calculatorTypeOptions: Array<{ display: string, value: string, numCalcs: number }> = [];
  treasureHuntSub: Subscription;

  displayUtilityTypeDropdown: boolean = false;
  displayCalculatorTypeDropdown: boolean = false;
  displayAdditionalFiltersDropdown: string = 'hide';
  sortByDropdown: boolean = false;
  treasureHunt: TreasureHunt;
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  sortByLabel: string;
  teams: Array<{ name: string, selected: boolean }>;
  equipments: Array<{ name: string, selected: boolean }>;
  opportunityCardsSub: Subscription;
  opportunityCardsData: Array<OpportunityCardData>;

  showImportModal: boolean;
  showImportModalSub: Subscription;
  showExportModal: boolean;
  showExportModalSub: Subscription;
  constructor(private opportuntiyCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService) { }

  ngOnInit() {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      this.setSortByLabel();
    });

    this.opportunityCardsSub = this.opportuntiyCardsService.opportunityCards.subscribe(val => {
      this.opportunityCardsData = val;
      this.setTeams(val);
      this.setEquipments(val);
      this.setEnergyTypeOptions(val);
      this.setCalculatorOptions(val);
    });

    this.showImportModalSub = this.treasureChestMenuService.showImportModal.subscribe(val => {
      this.showImportModal = val;
    });
    
    this.showExportModalSub = this.treasureChestMenuService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
    this.opportunityCardsSub.unsubscribe();
    this.clearAllFilters();
    this.showImportModalSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getNavbarWidth();
  }

  toggleUtilityType() {
    this.displayUtilityTypeDropdown = !this.displayUtilityTypeDropdown;
  }

  toggleCalculatorType() {
    this.displayCalculatorTypeDropdown = !this.displayCalculatorTypeDropdown;
  }

  toggleAdditionalFilters() {
    if (this.displayAdditionalFiltersDropdown == 'hide') {
      this.displayAdditionalFiltersDropdown = 'show';
    } else {
      this.displayAdditionalFiltersDropdown = 'hide';
    }
  }

  toggleSortBy() {
    this.sortByDropdown = !this.sortByDropdown;
  }

  selectAll() {
    this.treasureChestMenuService.selectAll.next(true);
    this.treasureChestMenuService.selectAll.next(false);
  }

  deselectAll(){
    this.treasureChestMenuService.deselectAll.next(true);
    this.treasureChestMenuService.deselectAll.next(false);
  }

  setTeams(oppData: Array<OpportunityCardData>) {
    let teamNames: Array<string> = this.treasureChestMenuService.getAllTeams(oppData);
    this.teams = new Array();
    teamNames.forEach(name => {
      this.teams.push({ name: name, selected: false });
    });
    this.sortCardsData.teams = _.intersection(this.sortCardsData.teams, teamNames);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  setEquipments(oppData: Array<OpportunityCardData>) {
    let equipmentNames: Array<string> = this.treasureChestMenuService.getAllEquipment(oppData);
    this.equipments = new Array();
    equipmentNames.forEach(equipment => {
      this.equipments.push({ name: equipment, selected: false });
    });
    this.sortCardsData.equipments = _.intersection(this.sortCardsData.equipments, equipmentNames);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  setSelectedTeam(team: { name: string, selected: boolean }) {
    team.selected = !team.selected;
    let selectedNames: Array<string> = new Array();
    this.teams.forEach(team => {
      if (team.selected == true) {
        selectedNames.push(team.name);
      }
    })
    this.sortCardsData.teams = selectedNames;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  setSelectedEquipment(equipment: { name: string, selected: boolean }) {
    equipment.selected = !equipment.selected;
    let selectedEquipment: Array<string> = new Array();
    this.equipments.forEach(equipment => {
      if (equipment.selected == true) {
        selectedEquipment.push(equipment.name);
      }
    })
    this.sortCardsData.equipments = selectedEquipment;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeTeam(teamName: string, index: number) {
    this.sortCardsData.teams.splice(index, 1);
    this.teams.forEach(team => {
      if (team.name == teamName) {
        team.selected = false;
      }
    });
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeEquipment(equipmentName: string, index: number) {
    this.sortCardsData.equipments.splice(index, 1);
    this.equipments.forEach(equipment => {
      if (equipment.name == equipmentName) {
        equipment.selected = false;
      }
    });
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  setSortBy(str: string) {
    this.sortCardsData.sortBy = str;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.toggleSortBy();
  }

  setSortByLabel() {
    if (this.sortCardsData.sortBy == 'annualCostSavings') {
      this.sortByLabel = 'Annual Savings';
    } else if (this.sortCardsData.sortBy == 'teamName') {
      this.sortByLabel = 'Team';
    } else if (this.sortCardsData.sortBy == 'name') {
      this.sortByLabel = 'Equipment Name';
    } else if (this.sortCardsData.sortBy == 'implementationCost') {
      this.sortByLabel = 'Implementation Cost';
    } else if (this.sortCardsData.sortBy == 'paybackPeriod') {
      this.sortByLabel = 'Payback Period';
    }
  }

  clearAllFilters() {
    this.teams.forEach(team => {
      team.selected = false;
    })
    this.equipments.forEach(equipment => {
      equipment.selected = false;
    })
    this.sortCardsData.teams = [];
    this.sortCardsData.equipments = [];
    this.sortCardsData.utilityType = 'All';
    this.sortCardsData.calculatorType = 'All';
    this.displayCalculatorType = 'All';
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.treasureChestMenuService.showImportModal.next(false);
    this.treasureChestMenuService.showExportModal.next(false);
  }

  getNavbarWidth() {
    if (this.navbar) {
      setTimeout(() => {
        this.navbarWidth = this.navbar.nativeElement.clientWidth * .95;
      }, 100);
    }
  }

  setEnergyType(str: string) {
    this.sortCardsData.utilityType = str;
    this.sortCardsData.calculatorType = 'All';
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.setCalculatorOptions(this.opportunityCardsData);
    this.toggleUtilityType();
  }

  setEnergyTypeOptions(oppData: Array<OpportunityCardData>) {
    this.energyTypeOptions = new Array();
    let numSteam: number = this.getFilteredCalcsByUtility(oppData, 'Steam').length;
    let numElectricity: number = this.getFilteredCalcsByUtility(oppData, 'Electricity').length;
    let numNaturalGas: number = this.getFilteredCalcsByUtility(oppData, 'Natural Gas').length;
    let numWater: number = this.getFilteredCalcsByUtility(oppData, 'Water').length;
    let numWasteWater: number = this.getFilteredCalcsByUtility(oppData, 'Waste Water').length;
    let numOtherFuel: number = this.getFilteredCalcsByUtility(oppData, 'Other Fuel').length;
    let numCompressedAir: number = this.getFilteredCalcsByUtility(oppData, 'Compressed Air').length;

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
    this.energyTypeOptions.unshift({ value: 'All', numCalcs: oppData.length });
  }

  setCalculatorType(calcOption: { display: string, value: string, numCalcs: number }) {
    this.displayCalculatorType = calcOption.display;
    this.sortCardsData.calculatorType = calcOption.value;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.toggleCalculatorType();
  }

  setCalculatorOptions(oppData: Array<OpportunityCardData>) {
    this.calculatorTypeOptions = new Array();
    let filteredCalcs: Array<OpportunityCardData> = oppData;
    if (this.sortCardsData.utilityType != 'All') {
      filteredCalcs = this.getFilteredCalcsByUtility(oppData, this.sortCardsData.utilityType)
    }
    this.calculatorTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: filteredCalcs.length });
    //lighting
    let numLighting: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'lighting-replacement' }).length;
    if (numLighting != 0) {
      this.calculatorTypeOptions.push({ display: 'Lighting Replacement', value: 'lighting-replacement', numCalcs: numLighting });
    }
    //opportunitySheets
    let numOppSheets: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'opportunity-sheet' }).length;
    if (numOppSheets != 0) {
      this.calculatorTypeOptions.push({ display: 'Opportunity Sheet', value: 'opportunity-sheet', numCalcs: numOppSheets });
    }
    //replaceExistingMotors
    let numReplaceExisting: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'replace-existing' }).length;
    if (numReplaceExisting != 0) {
      this.calculatorTypeOptions.push({ display: 'Replace Existing Motor', value: 'replace-existing', numCalcs: numReplaceExisting });
    }
    //motorDrives
    let numMotorDrives: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'motor-drive' }).length;
    if (numMotorDrives != 0) {
      this.calculatorTypeOptions.push({ display: 'Motor Drive', value: 'motor-drive', numCalcs: numMotorDrives });
    }
    //naturalGasReductions
    let numNgReductions: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'natural-gas-reduction' }).length;
    if (numNgReductions != 0) {
      this.calculatorTypeOptions.push({ display: 'Natural Gas Reduction', value: 'natural-gas-reduction', numCalcs: numNgReductions });
    }
    //electricityReductions
    let electricityReductions: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'electricity-reduction' }).length;
    if (electricityReductions != 0) {
      this.calculatorTypeOptions.push({ display: 'Electricity Reduction', value: 'electricity-reduction', numCalcs: electricityReductions });
    }
    //compressedAirReductions
    let compressedAirReductions: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'compressed-air-reduction' }).length;
    if (compressedAirReductions != 0) {
      this.calculatorTypeOptions.push({ display: 'Compressed Air Reduction', value: 'compressed-air-reduction', numCalcs: compressedAirReductions });
    }
    //compressedAirPressureReductions
    let compressedAirPressureReductions: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'compressed-air-pressure-reduction' }).length;
    if (compressedAirPressureReductions != 0) {
      this.calculatorTypeOptions.push({ display: 'Compressed Air Pressure Reduction', value: 'compressed-air-pressure-reduction', numCalcs: compressedAirPressureReductions });
    }
    //waterReductions
    let waterReductions: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'water-reduction' }).length;
    if (waterReductions != 0) {
      this.calculatorTypeOptions.push({ display: 'Water Reduction', value: 'water-reduction', numCalcs: waterReductions });
    }
    //steamReductions
    let steamReductions: number = _.filter(filteredCalcs, (calc) => { return calc.opportunityType == 'steam-reduction' }).length;
    if (steamReductions != 0) {
      this.calculatorTypeOptions.push({ display: 'Steam Reduction', value: 'steam-reduction', numCalcs: steamReductions });
    }
  }

  getFilteredCalcsByUtility(opData: Array<OpportunityCardData>, utilityType: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(opData, (data) => { return _.includes(data.utilityType, utilityType) });
    return filteredCards;
  }

  openImportModal() {
    this.treasureChestMenuService.showImportModal.next(true);
  }

  openExportModal() {
    this.treasureChestMenuService.showExportModal.next(true);
  }
}
