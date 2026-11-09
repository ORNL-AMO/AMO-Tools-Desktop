import { Component, Input } from '@angular/core';
import { TreasureHunt, TreasureHuntOpportunity } from '../models/treasure-hunt';
import { ExportOpportunitiesService } from '../../treasure-hunt/treasure-chest/export-opportunities.service';
import { OPPORTUNITY_EXPORT_SECTIONS, OpportunityExportSection } from '../../treasure-hunt/treasure-chest/opportunity-export-sections';

@Component({
  selector: 'app-opportunities-export-preview',
  templateUrl: './opportunities-export-preview.component.html',
  styleUrls: ['./opportunities-export-preview.component.css'],
  standalone: false
})
export class OpportunitiesExportPreviewComponent {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  includeUnselected: boolean = false;
  @Input()
  compact: boolean = false;

  readonly sections: ReadonlyArray<OpportunityExportSection> = OPPORTUNITY_EXPORT_SECTIONS;

  constructor(private exportOpportunitiesService: ExportOpportunitiesService) { }

  getOpportunityName(section: OpportunityExportSection, opportunity: TreasureHuntOpportunity, index: number): string {
    return this.exportOpportunitiesService.getOpportunityName(section, opportunity, index);
  }
}
