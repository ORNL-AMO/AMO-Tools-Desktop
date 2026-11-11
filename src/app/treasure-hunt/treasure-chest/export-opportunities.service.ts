import { Injectable } from '@angular/core';
import { AssessmentOpportunity, ImportExportOpportunities, OpportunitySheet, TreasureHunt, TreasureHuntOpportunity } from '../../shared/models/treasure-hunt';
import { OPPORTUNITY_EXPORT_SECTIONS, OpportunityCounts, OpportunityExportSection } from './opportunity-export-sections';

@Injectable({
  providedIn: 'root'
})
export class ExportOpportunitiesService {

  constructor() { }

  setImportExportData(treasureHunt: TreasureHunt, includeUnselected: boolean = false): ImportExportOpportunities {
    const exportOpportunities: ImportExportOpportunities = { origin: 'AMO-TOOLS-DESKTOP-OPPORTUNITIES' };
    OPPORTUNITY_EXPORT_SECTIONS.forEach(section => {
      // * each key holds a different opportunity array type, so TypeScript can't narrow the assignment per section
      exportOpportunities[section.key] = this.getSelectedOpportunitiesGeneric<TreasureHuntOpportunity>(treasureHunt[section.key], includeUnselected) as any;
    });
    return exportOpportunities;
  }

  hasUnselectedOpportunities(treasureHunt: TreasureHunt): boolean {
    const counts: OpportunityCounts = this.getOpportunityCounts(treasureHunt);
    return counts.selected < counts.total;
  }

  getOpportunityCounts(treasureHunt: TreasureHunt): OpportunityCounts {
    const allOpportunities: Array<TreasureHuntOpportunity> = OPPORTUNITY_EXPORT_SECTIONS.flatMap((section): Array<TreasureHuntOpportunity> => treasureHunt?.[section.key] ?? []);
    return {
      selected: allOpportunities.filter(opportunity => opportunity.selected).length,
      total: allOpportunities.length
    };
  }

  getIncludedOpportunityCount(counts: OpportunityCounts, includeUnselected: boolean): number {
    return includeUnselected ? counts.total : counts.selected;
  }

  getOpportunityName(section: OpportunityExportSection, opportunity: TreasureHuntOpportunity, index: number): string {
    const name: string = section.usesItemName ? (opportunity as OpportunitySheet | AssessmentOpportunity).name : opportunity.opportunitySheet?.name;
    return name || `${section.fallbackName} #${index + 1}`;
  }

  private getSelectedOpportunitiesGeneric<T extends TreasureHuntOpportunity>(opportunities: Array<T>, includeUnselected: boolean): Array<T> | undefined {
    if (opportunities && opportunities.length > 0) {
      if (includeUnselected) {
        return opportunities;
      }
      return opportunities.filter((opportunity) => opportunity.selected);
    }
    return undefined;
  }
}
