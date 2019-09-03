import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TreasureHunt, ImportExportOpportunities } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';
import { ModalDirective } from 'ngx-bootstrap';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ImportOpportunitiesService } from './import-opportunities.service';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-treasure-chest',
  templateUrl: './treasure-chest.component.html',
  styleUrls: ['./treasure-chest.component.css']
})
export class TreasureChestComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;

  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;
  @ViewChild('deletedItemModal') public deletedItemModal: ModalDirective;
  // @ViewChild('importExportModal') public importExportModal: ModalDirective;

  selectedCalc: string = 'none';

  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';
  helpTabSelect: string = 'results';

  deleteItemName: string;
  deleteItemIndex: number;
  itemType: string;
  opperatingHoursPerYear: number;
  showImportExportModal: boolean = false;
  selectedCalcSubscription: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  constructor(
    private treasureHuntService: TreasureHuntService,
    private importOpportunitiesService: ImportOpportunitiesService,
    private calculatorsService: CalculatorsService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    })
  }

  ngOnDestroy(){
    this.selectedCalcSubscription.unsubscribe();
  }

  //utilities
  setCaclulatorType(str: string) {
    this.displayCalculatorType = str;
  }
  setEnergyType(str: string) {
    this.displayEnergyType = str;
  }
  setHelpTab(str: string) {
    this.helpTabSelect = str;
  }
  selectCalc(str: string) {
    this.selectedCalc = str;
  }
  showOpportunitySheetModal() {
    this.opportunitySheetModal.show();
  }
  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }
  showSaveCalcModal() {
    this.saveCalcModal.show();
  }
  hideSaveCalcModal() {
    this.saveCalcModal.hide();
  }

  save() {
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
  }

  openImportExportModal() {
    this.showImportExportModal = true;
  }

  closeImportExportModal() {
    this.showImportExportModal = false;
  }

  importData(data: ImportExportOpportunities) {
    this.treasureHunt = this.importOpportunitiesService.importData(data, this.treasureHunt);
    this.save();
    this.treasureHuntService.updateMenuOptions.next(true);
  }
}
