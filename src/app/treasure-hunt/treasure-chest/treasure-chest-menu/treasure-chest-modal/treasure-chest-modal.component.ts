import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CoreService } from '../../../../core/core.service';
import { ExportToJustifiTemplateService } from '../../../../shared/export-to-justifi-modal/export-to-justifi-services/export-to-justifi-template.service';
import { EmailMeasurDataService } from '../../../../shared/email-measur-data/email-measur-data.service';
import { TreasureChestMenuService } from '../treasure-chest-menu.service';
import { Subscription } from 'rxjs';
import { OpportunityCardsService } from '../../opportunity-cards/opportunity-cards.service';
@Component({
  selector: 'app-treasure-chest-modal',
  standalone: false,
  templateUrl: './treasure-chest-modal.component.html',
  styleUrls: ['./treasure-chest-modal.component.css']
})
export class TreasureChestModalComponent {

  @ViewChild('treasureChestModal', { static: false }) public treasureChestModal: ModalDirective;

  opportunityCardsSub: Subscription;
  latestOpportunityCardList: any;
  constructor(
    private coreService: CoreService,
    private exportToJustifiTemplateService: ExportToJustifiTemplateService,
    private emailMeasurDataService: EmailMeasurDataService,
    private treasureChestMenuService: TreasureChestMenuService,
    private opportunityCardsService: OpportunityCardsService,
  ) { }

  ngOnInit() {
    this.opportunityCardsSub = this.opportunityCardsService.opportunityCards.subscribe(cardList => {
      this.latestOpportunityCardList = cardList;
    });
  }

  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.treasureChestModal.show();
  }

  hideModal() {
    this.treasureChestModal.hide();
    this.treasureChestModal.onHidden.subscribe(val => {
      this.treasureChestMenuService.showTreasureChestModal.next(false);
    });
  }

  showEmailTreasureHuntDataModal() {
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
    this.hideModal();
  }

  showExportToLocalModal() {
    this.exportToJustifiTemplateService.treasureHuntAttachment = this.latestOpportunityCardList;
    this.exportToJustifiTemplateService.showExportToJustifiModal.next(true);
    this.hideModal();
  }
}
