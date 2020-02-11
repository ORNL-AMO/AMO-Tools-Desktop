import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { ImportOpportunitiesService } from '../import-opportunities.service';
import { OpportunityCardsService } from '../opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';

@Component({
  selector: 'app-import-opportunities',
  templateUrl: './import-opportunities.component.html',
  styleUrls: ['./import-opportunities.component.css']
})
export class ImportOpportunitiesComponent implements OnInit {

  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;

  importInProgress: boolean = false;
  fileReference: any;
  validFile: boolean;
  importJson: any = null;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  constructor(private treasureHuntService: TreasureHuntService,
    private importOpportunitiesService: ImportOpportunitiesService, private opportunityCardsService: OpportunityCardsService,
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

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.json$/;
        if (regex.test($event.target.files[0].name)) {
          this.fileReference = $event;
          let fr: FileReader = new FileReader();
          fr.readAsText($event.target.files[0]);
          fr.onloadend = (e) => {
            try {
              this.importJson = JSON.parse(JSON.stringify(fr.result));
              this.checkData(this.importJson);
            } catch (err) {
              this.validFile = false;
            }
          };
        } else {
          let fr: FileReader = new FileReader();
          fr.readAsText($event.target.files[0]);
          fr.onloadend = (e) => {
            try {
              this.importJson = JSON.parse(JSON.stringify(fr.result));
              this.checkData(this.importJson);
            } catch (err) {
              this.validFile = false;
            }
          };
        }
      }
    }
  }

  importFile() {
    if (!this.importJson) {
      let fr: FileReader = new FileReader();
      fr.readAsText(this.fileReference.target.files[0]);
      fr.onloadend = (e) => {
        this.importJson = JSON.parse(JSON.stringify(fr.result));
        this.importData(this.importJson);
      };
    }
    else {
      this.importData(this.importJson);
    }
  }

  checkData(data: any) {
    let importData = JSON.parse(data);
    if (importData.origin == 'AMO-TOOLS-DESKTOP-OPPORTUNITIES') {
      this.validFile = true;
    } else {
      this.validFile = false;
    }
  }

  importData(data: any) {
    let importData = JSON.parse(data);
    this.treasureHunt = this.importOpportunitiesService.importData(importData, this.treasureHunt);
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
    this.opportunityCardsService.updateOpportunityCards.next(true);
    this.hideImportModal();
  }
}
