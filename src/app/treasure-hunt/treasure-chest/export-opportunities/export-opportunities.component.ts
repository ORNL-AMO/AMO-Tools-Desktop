import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities, TreasureHuntOpportunity } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { EmailMeasurDataService } from '../../../shared/email-measur-data/email-measur-data.service';
import { ExportOpportunitiesService } from '../export-opportunities.service';
@Component({
    selector: 'app-export-opportunities',
    templateUrl: './export-opportunities.component.html',
    styleUrls: ['./export-opportunities.component.css'],
    standalone: false
})
export class ExportOpportunitiesComponent implements OnInit {
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  exportOpportunities: ImportExportOpportunities;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  exportName: string = 'Opportunites Data';
  constructor(private importExportService: ImportExportService, 
    private treasureHuntService: TreasureHuntService,
    private treasureChestMenuService: TreasureChestMenuService,
    private emailMeasurDataService: EmailMeasurDataService,
    private exportOpportunitiesService: ExportOpportunitiesService
  ) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.exportOpportunities = this.exportOpportunitiesService.setImportExportData(this.treasureHunt);
    });
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.showExportModal();
  }

  showExportModal() {
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
    this.exportModal.onHidden.subscribe(val => {
      this.treasureChestMenuService.showExportModal.next(false);
    });
  }

  exportData() {
    this.importExportService.downloadOpportunities(this.exportOpportunities, this.exportName);
    this.hideExportModal();
  }

  showEmailMeasurDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'opportunities',
      itemName: '',
      itemData: ''
    }
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
    this.hideExportModal();
  }
}
