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
      this.setSortByLabel();
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

  // getCurrentFilters() {
  //    let filterOptions = [
  //     this.sortCardsData.utilityTypes,
  //     this.sortCardsData.calculatorTypes,
  //     this.sortCardsData.teams,
  //     this.sortCardsData.equipments
  //   ];
  //   let flattenedFilters = [];
  //   filterOptions.forEach((options) => {
  //     if (options[0].value != 'All') {
  //       let selectedFilters: Array<string> = _.map(options, (option) => { return option.display });
  //       flattenedFilters.push(selectedFilters);
  //     }
  //   })
  //   this.currentFilters = [].concat(...flattenedFilters);
  //   return this.currentFilters;
  // }

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
    this.teams.unshift({ display: 'All', value: 'All', selected: false, numCalcs: oppData.length })
    // this.sortCardsData.teams = [{ display: 'All', value: 'All' }];
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
    this.equipments.unshift({ display: 'All', value: 'All', selected: false, numCalcs: oppData.length })
    // this.sortCardsData.equipments = [{ display: 'All', value: 'All' }];
  }

  setSelectedEquipment(option: FilterOption) {
    let selectedFilters = this.getSelectedOptions(option, this.equipments)
    this.sortCardsData.equipments = selectedFilters;
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    // this.updateUtilityOptions();
    // this.updateTeamOptions();
    // this.updateCalculatorOptions();
  }

  //pass clicked option (selectedOption) and corresponding list to get all selected options
  getSelectedOptions(selectedOption: FilterOption, optionList: Array<FilterOption>): Array<{ display: string, value: string }> {
    let selected: Array<{ display: string, value: string }> = new Array();
    //if the selection isn't all
    if (selectedOption.value != 'All') {
      selectedOption.selected = !selectedOption.selected;
      optionList.forEach(option => {
        //set All to false if an option is selected
        if (selectedOption.selected && option.value == 'All') {
          option.selected = false;
        }
        //add every selected option
        if (option.selected == true) {
          selected.push({ display: option.display, value: option.value });
        }
      });
      //if non selected select all
      if (selected.length == 0) {
        let allOption: FilterOption = optionList.find(option => { return option.value == 'All' });
        allOption.selected = true;
        // selected = [{ display: 'All', value: 'All' }];
      }
    } else {
      //
      optionList.forEach(option => {
        if (option.value == 'All') {
          option.selected = true;
        } else {
          option.selected = false
        }
      });
      // selected = [{ display: 'All', value: 'All' }];
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
    this.sortCardsData.teams = [];
    this.sortCardsData.equipments = [];
    this.sortCardsData.utilityTypes = [];
    this.sortCardsData.calculatorTypes = [];
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
    this.teams.forEach(team => {
      if (team.value != 'All') {
        team.selected = false;
      } else {
        team.selected = true;
      }
    })
    this.equipments.forEach(equipment => {
      if (equipment.value != 'All') {
        equipment.selected = false;
      } else {
        equipment.selected = true;
      }
    })
    this.calculatorTypeOptions.forEach(option => {
      if (option.value != 'All') {
        option.selected = false;
      } else {
        option.selected = true;
      }
    })
    this.utilityTypeOptions.forEach(option => {
      if (option.value != 'All') {
        option.selected = false;
      } else {
        option.selected = true;
      }
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
    this.addUtilityOption('Electricity', oppData, this.utilityTypeOptions);
    this.addUtilityOption('Steam', oppData, this.utilityTypeOptions);
    this.addUtilityOption('Natural Gas', oppData, this.utilityTypeOptions);
    this.addUtilityOption('Water', oppData, this.utilityTypeOptions);
    this.addUtilityOption('Waste Water', oppData, this.utilityTypeOptions);
    this.addUtilityOption('Other Fuel', oppData, this.utilityTypeOptions);
    this.addUtilityOption('Compressed Air', oppData, this.utilityTypeOptions);
    let checkIsSelected: boolean = this.sortCardsData.utilityTypes.length == 0;
    this.utilityTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: oppData.length, selected: checkIsSelected });

    // let numSteam: number = this.getFilteredCalcsByUtility(oppData, 'Steam').length;
    // let numNaturalGas: number = this.getFilteredCalcsByUtility(oppData, 'Natural Gas').length;
    // let numWater: number = this.getFilteredCalcsByUtility(oppData, 'Water').length;
    // let numWasteWater: number = this.getFilteredCalcsByUtility(oppData, 'Waste Water').length;
    // let numOtherFuel: number = this.getFilteredCalcsByUtility(oppData, 'Other Fuel').length;
    // let numCompressedAir: number = this.getFilteredCalcsByUtility(oppData, 'Compressed Air').length;

    // let numElectricity: number = this.getFilteredCalcsByUtility(oppData, 'Electricity').length;
    // if(numElectricity != 0){
    //   this.utilityTypeOptions.push({display: 'Electricity', value: 'Electricity', numCalcs: numElectricity, selected: false });
    // }
    // this.utilityTypeOptions.push({display: 'Natural Gas', value: 'Natural Gas', numCalcs: numNaturalGas, selected: false });
    // this.utilityTypeOptions.push({display: 'Water', value: 'Water', numCalcs: numWater, selected: false });
    // this.utilityTypeOptions.push({display: 'Waste Water', value: 'Waste Water', numCalcs: numWasteWater, selected: false });
    // this.utilityTypeOptions.push({display: 'Other Fuel', value: 'Other Fuel', numCalcs: numOtherFuel, selected: false });
    // this.utilityTypeOptions.push({display: 'Compressed Air', value: 'Compressed Air', numCalcs: numCompressedAir, selected: false });
    // this.utilityTypeOptions.push({display: 'Steam', value: 'Steam', numCalcs: numSteam, selected: false });
    // this.utilityTypeOptions.unshift({display: 'All', value: 'All', numCalcs: oppData.length, selected: false });
  }

  addUtilityOption(utilityStr: string, oppData: Array<OpportunityCardData>, utilityTypeOptions: Array<FilterOption>) {
    let numUtility: number = this.getFilteredCalcsByUtility(oppData, utilityStr).length;
    if (numUtility != 0) {
      let checkIsSelected: { display: string, value: string } = this.sortCardsData.utilityTypes.find(utilityType => { return utilityType.value == utilityStr });
      utilityTypeOptions.push({ display: utilityStr, value: utilityStr, numCalcs: numUtility, selected: checkIsSelected != undefined });
    }
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
    // let filteredCalcs: Array<OpportunityCardData> = oppData;
    // if (this.sortCardsData.utilityTypes.length != 0) {
    //   let utilityValues: Array<string> = _.map(this.sortCardsData.utilityTypes, (utilType) => { return utilType.value });
    //   utilityValues.forEach(util => {
    //     filteredCalcs.concat(this.getFilteredCalcsByUtility(oppData, util));
    //   })
    // }

    // let numLighting: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'lighting-replacement').length;
    // let numOppSheets: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'opportunity-sheet').length;
    // let numReplaceExisting: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'replace-existing').length;
    // let numMotorDrives: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'motor-drive').length;
    // let numNgReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'natural-gas-reduction').length;
    // let electricityReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'electricity-reduction').length;
    // let compressedAirReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'compressed-air-reduction').length;
    // let compressedAirPressureReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'compressed-air-pressure-reduction').length;
    // let waterReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'water-reduction').length;
    // let steamReductions: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'steam-reduction').length;
    // let pipeInsulationReduction: number = this.getFilteredCalcsByCalculator(filteredCalcs, 'pipe-insulation-reduction').length;

    this.addCalculatorOption({ display: 'Lighting Replacement', value: 'lighting-replacement' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Opportunity Sheet', value: 'opportunity-sheet' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Replace Existing Motor', value: 'replace-existing' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Motor Drive', value: 'motor-drive' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Natural Gas Reduction', value: 'natural-gas-reduction' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Electricity Reduction', value: 'electricity-reduction' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Compressed Air Reduction', value: 'compressed-air-reduction' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Compressed Air Pressure Reduction', value: 'compressed-air-pressure-reduction' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Water Reduction', value: 'water-reduction' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Steam Reduction', value: 'steam-reduction' }, oppData, this.calculatorTypeOptions);
    this.addCalculatorOption({ display: 'Pipe Insulation Reduction', value: 'pipe-insulation-reduction' }, oppData, this.calculatorTypeOptions);

    let checkIsSelected: boolean = this.sortCardsData.calculatorTypes.length == 0;
    this.calculatorTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: oppData.length, selected: checkIsSelected });
    // this.calculatorTypeOptions.unshift({ display: 'All', value: 'All', numCalcs: filteredCalcs.length, selected: false });
  }

  addCalculatorOption(calcOption: { display: string, value: string }, oppData: Array<OpportunityCardData>, calculatorTypeOptions: Array<FilterOption>) {
    let numCalcs: number = this.getFilteredCalcsByCalculator(oppData, calcOption.value).length;
    if (numCalcs != 0) {
      let checkIsSelected: { display: string, value: string } = this.sortCardsData.calculatorTypes.find(calculatorType => { return calculatorType.value == calcOption.value });
      calculatorTypeOptions.push({ display: calcOption.display, value: calcOption.value, numCalcs: numCalcs, selected: checkIsSelected != undefined });
    }
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
    let filteredCards: Array<OpportunityCardData> = _.filter(oppData, (item: OpportunityCardData) => {
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
    this.equipments.forEach(equipment => {
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
