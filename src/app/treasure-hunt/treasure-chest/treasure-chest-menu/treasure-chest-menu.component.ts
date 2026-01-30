import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { EmailMeasurDataService } from '../../../shared/email-measur-data/email-measur-data.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { ImportExportOpportunities, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { ExportOpportunitiesService } from '../export-opportunities.service';
import { CoreService } from '../../../core/core.service';
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
    ],
    standalone: false
})
export class TreasureChestMenuComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inReport: boolean;

  showShareDataModal: boolean = false;
  showShareDataModalSub: Subscription;

  @ViewChild('navbar', { static: false }) navbar: ElementRef;
  navbarWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getNavbarWidth();
  }

  sortByDropdown: boolean = false;
  sortCardsData: SortCardsData;
  sortBySub: Subscription;
  sortByLabel: string;

  showImportModal: boolean;
  showImportModalSub: Subscription;
  showExportModal: boolean;
  showExportModalSub: Subscription;

  bannerCollapsed: boolean = true;
  dropdownShown: boolean = false;

  constructor(
    private treasureChestMenuService: TreasureChestMenuService,
    private cd: ChangeDetectorRef,
    private emailMeasurDataService: EmailMeasurDataService,
    private treasureHuntService: TreasureHuntService,
    private exportOpportunitiesService: ExportOpportunitiesService,
    private coreService: CoreService,
  ) { }

  ngOnInit() {

    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      this.setSortByLabel();
    });

    this.showImportModalSub = this.treasureChestMenuService.showImportModal.subscribe(val => {
      this.showImportModal = val;
    });

    this.showExportModalSub = this.treasureChestMenuService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.showShareDataModalSub = this.coreService.showShareDataModal.subscribe((showShareDataModal: boolean) => {
      this.showShareDataModal = showShareDataModal;
    });
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
    this.showImportModalSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.showShareDataModalSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getNavbarWidth();
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

  removeTeam(index: number) {
    this.sortCardsData.teams.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeEquipment(index: number) {
    this.sortCardsData.equipments.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeCalculator(index: number) {
    this.sortCardsData.calculatorTypes.splice(index, 1);
    this.treasureChestMenuService.sortBy.next(this.sortCardsData);
  }

  removeUtilityType(index: number) {
    this.sortCardsData.utilityTypes.splice(index, 1);
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
    this.treasureChestMenuService.showImportModal.next(false);
    this.treasureChestMenuService.showExportModal.next(false);
  }

  getNavbarWidth() {
    if (this.navbar) {
      this.navbarWidth = this.navbar.nativeElement.clientWidth * .95;
      if(window.innerWidth > 991){
        this.bannerCollapsed = false;
      } 
    }
    this.cd.detectChanges();
  }

  openImportModal() {
    this.treasureChestMenuService.showImportModal.next(true);
  }

  openShareDataModal() {
    const treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    const opportunitiesData: ImportExportOpportunities = this.exportOpportunitiesService.setImportExportData(treasureHunt);
    
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'opportunities',
      itemName: 'Treasure Hunt Opportunities',
      itemData: opportunitiesData
    }

    this.emailMeasurDataService.emailItemType.next('opportunities');
    this.coreService.showShareDataModal.next(true);
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    this.sortByDropdown = false;
    window.dispatchEvent(new Event("resize"));
  }

  collapseDropdown(){
    this.dropdownShown = !this.dropdownShown;
    this.sortByDropdown = false;
  }

}
