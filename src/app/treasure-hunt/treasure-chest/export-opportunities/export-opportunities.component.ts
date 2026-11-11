import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities } from '../../../shared/models/treasure-hunt';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { ExportOpportunitiesService } from '../export-opportunities.service';
import { OpportunityCounts } from '../opportunity-export-sections';

@Component({
    selector: 'app-export-opportunities',
    templateUrl: './export-opportunities.component.html',
    styleUrls: ['./export-opportunities.component.css'],
    standalone: false
})
export class ExportOpportunitiesComponent implements OnInit {
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  exportName: string = 'Opportunities Data';
  includeUnselected: boolean = false;
  hasUnselectedOpportunities: boolean = false;
  opportunityCounts: OpportunityCounts = { selected: 0, total: 0 };
  constructor(private importExportService: ImportExportService, 
    private treasureHuntService: TreasureHuntService,
    private treasureChestMenuService: TreasureChestMenuService,
    private exportOpportunitiesService: ExportOpportunitiesService
  ) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.opportunityCounts = this.exportOpportunitiesService.getOpportunityCounts(val);
      this.hasUnselectedOpportunities = this.exportOpportunitiesService.hasUnselectedOpportunities(val);
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
  }

  onExportModalHidden() {
    this.treasureChestMenuService.showExportModal.next(false);
  }

  exportData() {
    const exportOpportunities: ImportExportOpportunities = this.exportOpportunitiesService.setImportExportData(this.treasureHunt, this.includeUnselected);
    this.importExportService.downloadOpportunities(exportOpportunities, this.exportName);
    this.hideExportModal();
  }

  get includedOpportunityCount(): number {
    return this.exportOpportunitiesService.getIncludedOpportunityCount(this.opportunityCounts, this.includeUnselected);
  }
}
