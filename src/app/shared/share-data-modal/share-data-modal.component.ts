import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CoreService } from '../../core/core.service';
import { ExportToJustifiTemplateService } from '../export-to-justifi-modal/export-to-justifi-services/export-to-justifi-template.service';
import { EmailMeasurDataService } from '../email-measur-data/email-measur-data.service';
import { TreasureChestMenuService } from '../../treasure-hunt/treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
@Component({
  selector: 'app-share-data-modal',
  standalone: false,
  templateUrl: './share-data-modal.component.html',
  styleUrl: './share-data-modal.component.css'
})
export class ShareDataModalComponent {

  @ViewChild('shareDataModal', { static: false }) public shareDataModal: ModalDirective;

  isTreasureHuntOpportunities: boolean = false;
  constructor(
    private coreService: CoreService,
    private exportToJustifiTemplateService: ExportToJustifiTemplateService,
    private emailMeasurDataService: EmailMeasurDataService,
    private treasureChestMenuService: TreasureChestMenuService
  ) { }

  ngOnInit() {
    this.isTreasureHuntOpportunities = this.emailMeasurDataService.measurItemAttachment.itemType === "opportunities";
  }

  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.shareDataModal.show();
  }

  hideModal() {
    this.shareDataModal.hide();
    this.shareDataModal.onHidden.subscribe(val => {
      this.coreService.showShareDataModal.next(false);
    });
  }

  showEmailMeasurDataModal() {
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
    this.hideModal();
  }

  showExportModal() {
    if (this.isTreasureHuntOpportunities === true) {
      this.treasureChestMenuService.showExportModal.next(true);
    } else {
      this.exportToJustifiTemplateService.showExportToJustifiModal.next(true);
    }
    this.hideModal();
  }
}
