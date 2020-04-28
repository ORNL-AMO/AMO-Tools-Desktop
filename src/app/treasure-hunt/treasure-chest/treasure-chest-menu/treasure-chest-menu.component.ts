import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TreasureHunt, FilterOption } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { processEquipmentOptions } from '../../calculators/opportunity-sheet/general-details-form/processEquipmentOptions';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { SortCardsService } from '../opportunity-cards/sort-cards.service';

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
  @Input()
  inReport: boolean;

  @ViewChild('navbar', { static: false }) navbar: ElementRef;
  navbarWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getNavbarWidth();
  }

  utilityTypeOptions: Array<FilterOption> = [];
  calculatorTypeOptions: Array<FilterOption> = [];
  teams: Array<FilterOption>;
  equipments: Array<FilterOption>;
  treasureHuntSub: Subscription;

  displayUtilityTypeDropdown: boolean = false;
  displayCalculatorTypeDropdown: boolean = false;
  displayTeamDropdown: boolean = false;
  displayEquipment: boolean = false;
  displayAdditionalFiltersDropdown: string = 'hide';
  sortByDropdown: boolean = false;
  treasureHunt: TreasureHunt;
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  sortByLabel: string;
  opportunityCardsSub: Subscription;
  opportunityCardsData: Array<OpportunityCardData>;
  allTeamNames: string[];
  allEquipmentNames: string[];
  currentFilters: string[];

  showImportModal: boolean;
  showImportModalSub: Subscription;
  showExportModal: boolean;
  showExportModalSub: Subscription;
  constructor(private opportuntityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private treasureHuntService: TreasureHuntService, private sortCardsService: SortCardsService) { }

  ngOnInit() {
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
    });

    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    let oppData = this.opportuntityCardsService.getOpportunityCardsData(treasureHunt, this.settings);
    this.setTeams(oppData);
    this.setEquipments(oppData);
    this.setUtilityTypeOptions(oppData);
    this.setCalculatorOptions(oppData);

    this.opportunityCardsSub = this.opportuntityCardsService.opportunityCards.subscribe(val => {
      this.opportunityCardsData = val;
      // Update numCalcs on ANY filter change
      // this.updateEquipmentOptions();
      // this.updateCalculatorOptions();
      // this.updateTeamOptions();
      // this.updateUtilityOptions();
    });

    this.showImportModalSub = this.treasureChestMenuService.showImportModal.subscribe(val => {
      this.showImportModal = val;
    });

    this.showExportModalSub = this.treasureChestMenuService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

  }

  getCurrentFilters() {
     let filterOptions = [
      this.sortCardsData.utilityTypes,
      this.sortCardsData.calculatorTypes,
      this.sortCardsData.teams,
      this.sortCardsData.equipments
    ];
    let flattenedFilters = [];
    filterOptions.forEach((options) => {
      if (options[0].value != 'All') {
        let selectedFilters: Array<string> = _.map(options, (option) => { return option.display });
        flattenedFilters.push(selectedFilters);
      }
    })
    this.currentFilters = [].concat(...flattenedFilters);
    return this.currentFilters;
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
    this.opportunityCardsSub.unsubscribe();
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

  toggleTeams() {
    this.displayTeamDropdown = !this.displayTeamDropdown;
  }

  toggleEquipment() {
    this.displayEquipment = !this.displayEquipment;
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

  deselectAll() {
    this.treasureChestMenuService.deselectAll.next(true);
    this.treasureChestMenuService.deselectAll.next(false);
  }

  setTeams(oppData: Array<OpportunityCardData>) {
    if (!this.allTeamNames) {
      this.allTeamNames = this.treasureChestMenuService.getAllTeams(oppData);
    }
    this.teams = new Array();
    this.allTeamNames.forEach(teamName => {
      this.teams.push({
        display: teamName,
        value: teamName,
        selected: false,
        numCalcs: this.getFilteredCalcsByTeam(oppData, teamName).length
      });
    });
    this.teams.unshift({display: 'Reset', value: 'All', selected: false, numCalcs: oppData.length})
    this.sortCardsData.teams = [{display: 'Reset', value: 'All'}];
  }

  setSelectedTeam(selectedTeam: FilterOption) {
    let selectedFilters = this.getSelectedOptions(selectedTeam, this.teams);
    this.sortCardsData.teams = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    // this.updateUtilityOptions();
    // this.updateCalculatorOptions();
    // this.updateEquipmentOptions();
  }

  setEquipments(oppData: Array<OpportunityCardData>) {
    if (!this.allEquipmentNames) {
      this.allEquipmentNames = this.treasureChestMenuService.getAllEquipment(oppData);
    }
    this.equipments = new Array();
    this.allEquipmentNames.forEach(equipment => {
      let equipmentVal: { value: string, display: string } = processEquipmentOptions.find(option => { return option.value == equipment });
      if (equipmentVal) {
        this.equipments.push({ 
          display: equipmentVal.display, 
          value: equipmentVal.value, 
          selected: false,
          numCalcs: this.getFilteredCalcsByEquipment(oppData, equipmentVal.value).length
        });
      }
    });
    this.equipments.unshift({display: 'Reset', value: 'All', selected: false, numCalcs: oppData.length})
    this.sortCardsData.equipments = [{display: 'Reset', value: 'All'}];
  }
  
  setSelectedEquipment(option: FilterOption) {
    let selectedFilters = this.getSelectedOptions(option, this.equipments)
    this.sortCardsData.equipments = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    // this.updateUtilityOptions();
    // this.updateTeamOptions();
    // this.updateCalculatorOptions();
  }

  getSelectedOptions(option: FilterOption, optionList: Array<FilterOption>): Array<{display: string, value: string}> {
    let selected: Array<{display: string, value: string}> = new Array();
    if (option.value != 'All') {
      option.selected = !option.selected;
      optionList.forEach(option => {
          if (option.selected == true) {
            selected.push({display: option.display, value: option.value});
          }
        });
        if (selected.length == 0) {
              selected = [{display: 'Reset', value: 'All'}];
        }
    } else {
      optionList.forEach(option => {
          option.selected = false
      });
      selected = [{display: 'Reset', value: 'All'}];
    }
    return selected;
  }



  removeTeam(teamName: string, index: number) {
    this.sortCardsData.teams.splice(index, 1);
    this.teams.forEach(team => {
      if (team.value == teamName) {
        team.selected = false;
      }
    });
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeEquipment(equipmentItem: { display: string, value: string }, index: number) {
    this.sortCardsData.equipments.splice(index, 1);
    this.equipments.forEach(equipment => {
      if (equipment.value == equipmentItem.value) {
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
    this.sortCardsData.teams = [{display: 'Reset', value: 'All'}];
    this.sortCardsData.equipments = [{display: 'Reset', value: 'All'}];
    this.sortCardsData.utilityTypes = [{display: 'Reset', value: 'All'}];
    this.sortCardsData.calculatorTypes = [{display: 'Reset', value: 'All'}];
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.teams.forEach(team => {
      team.selected = false;
    })
    this.equipments.forEach(equipment => {
      equipment.selected = false;
    })
    this.calculatorTypeOptions.forEach(option => {
      option.selected = false;
    })
    this.utilityTypeOptions.forEach(option => {
      option.selected = false;
    })
    // this.updateCalculatorOptions(true);
    // this.updateEquipmentOptions(true);
    // this.updateTeamOptions(true);
    // this.updateUtilityOptions(true);
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

  setUtilityType(utilityOption: FilterOption) {
    let selectedFilters = this.getSelectedOptions(utilityOption, this.utilityTypeOptions);
    this.sortCardsData.utilityTypes = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    // this.updateCalculatorOptions();
    // this.updateTeamOptions();
    // this.updateEquipmentOptions();
  }


  setUtilityTypeOptions(oppData: Array<OpportunityCardData>) {
    oppData = this.sortCardsService.sortCards(oppData, this.sortCardsData);
    this.utilityTypeOptions = new Array();

    let numSteam: number = this.getFilteredCalcsByUtility(oppData, 'Steam').length;
    let numElectricity: number = this.getFilteredCalcsByUtility(oppData, 'Electricity').length;
    let numNaturalGas: number = this.getFilteredCalcsByUtility(oppData, 'Natural Gas').length;
    let numWater: number = this.getFilteredCalcsByUtility(oppData, 'Water').length;
    let numWasteWater: number = this.getFilteredCalcsByUtility(oppData, 'Waste Water').length;
    let numOtherFuel: number = this.getFilteredCalcsByUtility(oppData, 'Other Fuel').length;
    let numCompressedAir: number = this.getFilteredCalcsByUtility(oppData, 'Compressed Air').length;

    this.utilityTypeOptions.push({display: 'Electricity', value: 'Electricity', numCalcs: numElectricity, selected: false });
    this.utilityTypeOptions.push({display: 'Natural Gas', value: 'Natural Gas', numCalcs: numNaturalGas, selected: false });
    this.utilityTypeOptions.push({display: 'Water', value: 'Water', numCalcs: numWater, selected: false });
    this.utilityTypeOptions.push({display: 'Waste Water', value: 'Waste Water', numCalcs: numWasteWater, selected: false });
    this.utilityTypeOptions.push({display: 'Other Fuel', value: 'Other Fuel', numCalcs: numOtherFuel, selected: false });
    this.utilityTypeOptions.push({display: 'Compressed Air', value: 'Compressed Air', numCalcs: numCompressedAir, selected: false });
    this.utilityTypeOptions.push({display: 'Steam', value: 'Steam', numCalcs: numSteam, selected: false });
    this.utilityTypeOptions.unshift({display: 'Reset', value: 'All', numCalcs: oppData.length, selected: false });
  }

  setCalculatorType(calcOption: FilterOption) {
    let selectedFilters = this.getSelectedOptions(calcOption, this.calculatorTypeOptions);
    this.sortCardsData.calculatorTypes = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    // this.updateUtilityOptions();
    // this.updateTeamOptions();
    // this.updateEquipmentOptions();
  }

  setCalculatorOptions(oppData: Array<OpportunityCardData>) {
    this.calculatorTypeOptions = new Array();
    let filteredCalcs: Array<OpportunityCardData> = oppData;
    if (this.sortCardsData.utilityTypes[0].value != 'All') {
      let utilityValues: Array<string> = _.map(this.sortCardsData.utilityTypes, (utilType) => { return utilType.value });
      utilityValues.forEach(util => {
        filteredCalcs.concat(this.getFilteredCalcsByUtility(oppData, util));
      })
    }

    let numLighting: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'lighting-replacement').length;
    let numOppSheets: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'opportunity-sheet').length;
    let numReplaceExisting: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'replace-existing').length;
    let numMotorDrives: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'motor-drive').length;
    let numNgReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'natural-gas-reduction').length;
    let electricityReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'electricity-reduction').length;
    let compressedAirReductions: number =this.getFilteredCalcsByCalculator(filteredCalcs, 'compressed-air-reduction').length;
    let compressedAirPressureReductions: number =this.getFilteredCalcsByCalculator(filteredCalcs, 'compressed-air-pressure-reduction').length;
    let waterReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'water-reduction').length;
    let steamReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'steam-reduction').length;
    let pipeInsulationReduction: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'pipe-insulation-reduction').length;

    this.calculatorTypeOptions.push({ display: 'Lighting Replacement', value: 'lighting-replacement', numCalcs: numLighting, selected: false });
    this.calculatorTypeOptions.push({ display: 'Opportunity Sheet', value: 'opportunity-sheet', numCalcs: numOppSheets, selected: false });
    this.calculatorTypeOptions.push({ display: 'Replace Existing Motor', value: 'replace-existing', numCalcs: numReplaceExisting, selected: false });
    this.calculatorTypeOptions.push({ display: 'Motor Drive', value: 'motor-drive', numCalcs: numMotorDrives, selected: false });
    this.calculatorTypeOptions.push({ display: 'Natural Gas Reduction', value: 'natural-gas-reduction', numCalcs: numNgReductions, selected: false });
    this.calculatorTypeOptions.push({ display: 'Electricity Reduction', value: 'electricity-reduction', numCalcs: electricityReductions, selected: false });
    this.calculatorTypeOptions.push({ display: 'Compressed Air Reduction', value: 'compressed-air-reduction', numCalcs: compressedAirReductions, selected: false });
    this.calculatorTypeOptions.push({ display: 'Compressed Air Pressure Reduction', value: 'compressed-air-pressure-reduction', numCalcs: compressedAirPressureReductions, selected: false });
    this.calculatorTypeOptions.push({ display: 'Water Reduction', value: 'water-reduction', numCalcs: waterReductions, selected: false });
    this.calculatorTypeOptions.push({ display: 'Steam Reduction', value: 'steam-reduction', numCalcs: steamReductions, selected: false });
    this.calculatorTypeOptions.push({ display: 'Pipe Insulation Reduction', value: 'pipe-insulation-reduction', numCalcs: pipeInsulationReduction, selected: false });
    this.calculatorTypeOptions.unshift({ display: 'Reset', value: 'All', numCalcs: filteredCalcs.length, selected: false });
  }

  getFilteredCalcsByCalculator(oppData: Array<OpportunityCardData>, calculatorType: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.opportunityType, calculatorType) });
    return filteredCards;
  }

  getFilteredCalcsByUtility(oppData: Array<OpportunityCardData>, utilityType: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.utilityType, utilityType) });
    return filteredCards;
  }

  getFilteredCalcsByEquipment(oppData: Array<OpportunityCardData>, equipment: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> =  _.filter(oppData, (item: OpportunityCardData) => {
      if (item.opportunitySheet) {
        return _.includes(item.opportunitySheet.equipment, equipment);
      } else {
        return false;
      }
    });
    return filteredCards;
  }

  getFilteredCalcsByTeam(oppData: Array<OpportunityCardData>, selectedTeam: string): Array<OpportunityCardData> {
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (data) => { return _.includes(data.teamName, selectedTeam) });
    return filteredCards;
  }

  updateEquipmentOptions(clearSelected?: boolean) {
    this.equipments.forEach(equipment =>{
      equipment.numCalcs = this.getFilteredCalcsByEquipment(this.opportunityCardsData, equipment.value).length;
      if (clearSelected) {
        equipment.selected = false;
      }
    });
  }

  updateUtilityOptions(clearSelected?: boolean) {
    this.utilityTypeOptions.forEach(option => {
      option.numCalcs = this.getFilteredCalcsByUtility(this.opportunityCardsData, option.value).length;
      if (clearSelected) {
        option.selected = false;
      }
    })
  }

  updateTeamOptions(clearSelected?: boolean) {
    this.teams.forEach(team => {
      team.numCalcs = this.getFilteredCalcsByTeam(this.opportunityCardsData, team.value).length
      if (clearSelected) {
        team.selected = false;
      }
    });
  }

  updateCalculatorOptions(clearSelected?: boolean) {
    this.calculatorTypeOptions.forEach(calcOption => {
      calcOption.numCalcs = this.getFilteredCalcsByCalculator(this.opportunityCardsData, calcOption.value).length
      if (clearSelected) {
        calcOption.selected = false;
      }
    });

  }

  openImportModal() {
    this.treasureChestMenuService.showImportModal.next(true);
  }

  openExportModal() {
    this.treasureChestMenuService.showExportModal.next(true);
  }
}
