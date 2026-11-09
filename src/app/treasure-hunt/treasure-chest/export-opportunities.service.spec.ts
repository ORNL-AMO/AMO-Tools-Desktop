import { TestBed } from '@angular/core/testing';

import { ExportOpportunitiesService } from './export-opportunities.service';
import { OPPORTUNITY_EXPORT_SECTIONS } from './opportunity-export-sections';
import { ImportExportOpportunities, TreasureHunt } from '../../shared/models/treasure-hunt';

function makeTreasureHunt(selectedFlags: Array<boolean>): TreasureHunt {
  return {
    opportunitySheets: selectedFlags.map((selected, index) => ({ name: `Sheet ${index + 1}`, selected })),
    wallLosses: [{ selected: true }]
  } as TreasureHunt;
}

describe('ExportOpportunitiesService', () => {
  let service: ExportOpportunitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportOpportunitiesService);
  });

  describe('setImportExportData', () => {
    it('writes the origin and a key for every export section', () => {
      const exported: ImportExportOpportunities = service.setImportExportData(makeTreasureHunt([true]));
      expect(exported.origin).toBe('AMO-TOOLS-DESKTOP-OPPORTUNITIES');
      OPPORTUNITY_EXPORT_SECTIONS.forEach(section => expect(section.key in exported).withContext(section.key).toBeTrue());
    });

    it('drops unselected opportunities by default', () => {
      const exported: ImportExportOpportunities = service.setImportExportData(makeTreasureHunt([true, false]));
      expect(exported.opportunitySheets.length).toBe(1);
      expect(exported.wallLosses.length).toBe(1);
    });

    it('keeps unselected opportunities when includeUnselected is true', () => {
      const exported: ImportExportOpportunities = service.setImportExportData(makeTreasureHunt([true, false]), true);
      expect(exported.opportunitySheets.length).toBe(2);
    });

    it('leaves a section undefined when the treasure hunt has none of that opportunity', () => {
      const exported: ImportExportOpportunities = service.setImportExportData(makeTreasureHunt([false]));
      expect(exported.lightingReplacements).toBeUndefined();
    });

    it('leaves a section empty when none of its opportunities are selected', () => {
      const exported: ImportExportOpportunities = service.setImportExportData(makeTreasureHunt([false]));
      expect(exported.opportunitySheets).toEqual([]);
    });
  });

  describe('counts', () => {
    it('counts selected and total opportunities across sections', () => {
      expect(service.getOpportunityCounts(makeTreasureHunt([true, false]))).toEqual({ selected: 2, total: 3 });
    });

    it('reports unselected opportunities only when some exist', () => {
      expect(service.hasUnselectedOpportunities(makeTreasureHunt([true, false]))).toBeTrue();
      expect(service.hasUnselectedOpportunities(makeTreasureHunt([true]))).toBeFalse();
    });

    it('returns the included count based on includeUnselected', () => {
      const counts = { selected: 2, total: 3 };
      expect(service.getIncludedOpportunityCount(counts, false)).toBe(2);
      expect(service.getIncludedOpportunityCount(counts, true)).toBe(3);
    });
  });
});
