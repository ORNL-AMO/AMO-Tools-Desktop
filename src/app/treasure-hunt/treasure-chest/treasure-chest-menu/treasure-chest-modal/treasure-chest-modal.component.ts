import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { EmailMeasurDataService } from '../../../../shared/email-measur-data/email-measur-data.service';
import { TreasureChestMenuService } from '../treasure-chest-menu.service';
import { ImportExportOpportunities } from '../../../../shared/models/treasure-hunt';
import { TreasureHunt } from '../../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
@Component({
  selector: 'app-treasure-chest-modal',
  standalone: false,
  templateUrl: './treasure-chest-modal.component.html',
  styleUrls: ['./treasure-chest-modal.component.css']
})
export class TreasureChestModalComponent {

  @ViewChild('treasureChestModal', { static: false }) public treasureChestModal: ModalDirective;

  exportOpportunities: ImportExportOpportunities
  treasureHunt: TreasureHunt;

  constructor(
    private emailMeasurDataService: EmailMeasurDataService,
    private treasureChestMenuService: TreasureChestMenuService,
  ) { }

  ngOnInit() {
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
    this.treasureChestMenuService.showExportModal.next(true);
    this.hideModal();
  }
}
