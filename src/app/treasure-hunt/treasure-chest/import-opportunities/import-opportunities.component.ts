import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { ImportOpportunitiesService } from '../import-opportunities.service';
import { OpportunityCardsService } from '../opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { FileImportStatus, ImportService } from '../../../shared/import-export/import.service';

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
    if ($event.target.files && $event.target.files.length !== 0) {
      let jsonRegex = /.json$/;
      this.fileReference = $event;
      if (jsonRegex.test($event.target.files[0].name)) {
        const fileContent = await this.importService.readFileAsText($event.target.files[0]);
        this.importJson = JSON.parse(fileContent);

        this.fileImportStatus = this.importService.getIsValidImportType(this.importJson, 'AMO-TOOLS-DESKTOP-OPPORTUNITIES');
      } else {
        this.fileImportStatus = {
          fileType: 'UNKNOWN',
          isValid: false
        };
      }
    }
  }

  importFile() {
    let importData = this.importJson;
    this.treasureHunt = this.importOpportunitiesService.importData(importData, this.treasureHunt);
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
    this.opportunityCardsService.updateOpportunityCards.next(true);
    this.hideImportModal();
  }
}
