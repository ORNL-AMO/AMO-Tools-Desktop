import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ModalModule } from 'ngx-bootstrap/modal';

import { ExportOpportunitiesComponent } from './export-opportunities.component';
import { ExportOpportunitiesService } from '../export-opportunities.service';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { EmailMeasurDataService } from '../../../shared/email-measur-data/email-measur-data.service';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';

function makeTreasureHunt(selectedFlags: Array<boolean>): TreasureHunt {
  return {
    opportunitySheets: selectedFlags.map((selected, index) => ({ name: `Sheet ${index + 1}`, selected }))
  } as TreasureHunt;
}

describe('ExportOpportunitiesComponent', () => {
  let component: ExportOpportunitiesComponent;
  let fixture: ComponentFixture<ExportOpportunitiesComponent>;
  let treasureHuntSubject: BehaviorSubject<TreasureHunt>;
  let importExportServiceSpy: jasmine.SpyObj<ImportExportService>;

  function createComponent(treasureHunt: TreasureHunt) {
    treasureHuntSubject.next(treasureHunt);
    fixture = TestBed.createComponent(ExportOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function getIncludeUnselectedCheckbox(): HTMLInputElement {
    return document.querySelector('#includeUnselected');
  }

  beforeEach(async () => {
    treasureHuntSubject = new BehaviorSubject<TreasureHunt>(undefined);
    importExportServiceSpy = jasmine.createSpyObj('ImportExportService', ['downloadOpportunities']);

    await TestBed.configureTestingModule({
      declarations: [ExportOpportunitiesComponent],
      imports: [FormsModule, ModalModule.forRoot()],
      providers: [
        ExportOpportunitiesService,
        { provide: ImportExportService, useValue: importExportServiceSpy },
        { provide: TreasureHuntService, useValue: { treasureHunt: treasureHuntSubject } },
        { provide: TreasureChestMenuService, useValue: { showExportModal: new BehaviorSubject<boolean>(false) } },
        { provide: EmailMeasurDataService, useValue: {} }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('shows the include unselected checkbox when an opportunity is unselected', () => {
    createComponent(makeTreasureHunt([true, false]));
    expect(component.hasUnselectedOpportunities).toBeTrue();
    expect(getIncludeUnselectedCheckbox()).not.toBeNull();
  });

  it('hides the include unselected checkbox when every opportunity is selected', () => {
    createComponent(makeTreasureHunt([true, true]));
    expect(component.hasUnselectedOpportunities).toBeFalse();
    expect(getIncludeUnselectedCheckbox()).toBeNull();
  });

  it('updates the checkbox visibility when the treasure hunt changes', () => {
    createComponent(makeTreasureHunt([true, true]));
    treasureHuntSubject.next(makeTreasureHunt([false]));
    fixture.detectChanges();
    expect(getIncludeUnselectedCheckbox()).not.toBeNull();
  });

  it('exports only selected opportunities by default', () => {
    createComponent(makeTreasureHunt([true, false]));
    component.exportData();
    const exported = importExportServiceSpy.downloadOpportunities.calls.mostRecent().args[0];
    expect(exported.opportunitySheets.length).toBe(1);
  });

  it('exports unselected opportunities when include unselected is checked', () => {
    createComponent(makeTreasureHunt([true, false]));
    component.includeUnselected = true;
    component.exportData();
    const exported = importExportServiceSpy.downloadOpportunities.calls.mostRecent().args[0];
    expect(exported.opportunitySheets.length).toBe(2);
    expect(exported.opportunitySheets[1].selected).toBeFalse();
  });
});
