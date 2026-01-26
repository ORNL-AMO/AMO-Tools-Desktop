import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { ImportOpportunitiesService } from '../import-opportunities.service';
import { OpportunityCardsService } from '../opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { FileImportStatus, ImportService } from '../../../shared/import-export/import.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-import-opportunities',
    templateUrl: './import-opportunities.component.html',
    styleUrls: ['./import-opportunities.component.css'],
    standalone: false
})
export class ImportOpportunitiesComponent implements OnInit {

  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;

  importInProgress: boolean = false;
  fileReference: any;
  fileImportStatus: FileImportStatus;
  importJson: any = null;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  constructor(private treasureHuntService: TreasureHuntService,
    private importOpportunitiesService: ImportOpportunitiesService, private opportunityCardsService: OpportunityCardsService,
    private importService: ImportService,
    private treasureChestMenuService: TreasureChestMenuService) { }

 ngOnInit() {
   this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
     this.treasureHunt = val;
   });
  }

  ngOnDestroy(){
    this.treasureHuntSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.showImportModal();
  }

  showImportModal() {
    this.importModal.show();
  }

  hideImportModal() {
    this.importModal.hide();
    this.importModal.onHidden.subscribe(val => {
      this.treasureChestMenuService.showImportModal.next(false);
    });
  }

  async setImportFile($event) {
    console.log('set import file called');
    if ($event.target.files && $event.target.files.length !== 0) {
      let jsonRegex = /.json$/;
      this.fileReference = $event;
      if (jsonRegex.test($event.target.files[0].name)) {
        const fileContent = await this.importService.readFileAsText($event.target.files[0]);
        const parsed = JSON.parse(fileContent);
        console.log('parsed import file', parsed);
        // Check for the new structure (should use 'origin')
        if (parsed && parsed.origin === 'AMO-TOOLS-DESKTOP-OPPORTUNITIES' && Array.isArray(parsed.opportunities)) {
          this.importJson = parsed.opportunities;
          this.fileImportStatus = this.importService.getIsValidImportType(parsed, 'AMO-TOOLS-DESKTOP-OPPORTUNITIES');
        } else if (Array.isArray(parsed)) {
          // legacy: root is an array of opportunities
          this.importJson = parsed;
          this.fileImportStatus = { isValid: true, fileType: 'AMO-TOOLS-DESKTOP-OPPORTUNITIES' };
        } else {
          // fallback: invalid
          this.importJson = parsed;
          this.fileImportStatus = this.importService.getIsValidImportType(parsed, 'AMO-TOOLS-DESKTOP-OPPORTUNITIES');
        }
      } else {
        this.fileImportStatus = {
          fileType: 'UNKNOWN',
          isValid: false
        };
      }
    }
  }

  importFile() {
// uses new import logic and also applies opportunities into the opportunity cards, which is seperate from the treasure hunt used to save.


    let importData = this.importJson;
    // console.log('import data', importData);


    // this.treasureHunt = this.importOpportunitiesService.importData(importData, this.treasureHunt);
    this.treasureHunt = this.importOpportunitiesService.importOpportunities(importData, this.treasureHunt);
    // console.log('updated TH', this.treasureHunt);
    // its already in opp card structure at this point. just set it
    
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
    // this.opportunityCardsService.opportunityCards.next(importData);
    this.opportunityCardsService.updateOpportunityCards.next(false);


    // this.treasureHunt = this.reintegrateOpportunities(importData, this.treasureHunt);
    //     console.log('import complete', this.treasureHunt);
    // this.treasureHuntService.treasureHunt.next(this.treasureHunt);
    // this.opportunityCardsService.updateOpportunityCards.next(true);


    this.hideImportModal();
  }
}
