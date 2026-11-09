import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EmailMeasurDataComponent } from './email-measur-data.component';
import { EmailMeasurDataService, MeasurItemAttachment } from './email-measur-data.service';
import { ContactDbService } from '../../indexedDb/contact-db.service';
import { ExportService } from '../import-export/export.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ExportOpportunitiesService } from '../../treasure-hunt/treasure-chest/export-opportunities.service';
import { ImportExportOpportunities, TreasureHunt } from '../models/treasure-hunt';
import { OpportunitiesExportPreviewComponent } from '../opportunities-export-preview/opportunities-export-preview.component';

function makeTreasureHunt(selectedFlags: Array<boolean>): TreasureHunt {
  return {
    opportunitySheets: selectedFlags.map((selected, index) => ({ name: `Sheet ${index + 1}`, selected }))
  } as TreasureHunt;
}

function makeOpportunitiesAttachment(selectedFlags: Array<boolean>): MeasurItemAttachment {
  return {
    itemType: 'opportunities',
    itemName: 'Treasure Hunt Opportunities',
    itemData: makeTreasureHunt(selectedFlags)
  };
}

describe('EmailMeasurDataComponent', () => {
  let component: EmailMeasurDataComponent;
  let fixture: ComponentFixture<EmailMeasurDataComponent>;
  let emailMeasurDataService: EmailMeasurDataService;

  function createComponent(attachment: MeasurItemAttachment) {
    emailMeasurDataService.measurItemAttachment = attachment;
    fixture = TestBed.createComponent(EmailMeasurDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function getIncludeUnselectedCheckbox(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#includeUnselected');
  }

  function getAttachment(): ImportExportOpportunities {
    return emailMeasurDataService.measurEmailData.attachment as ImportExportOpportunities;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailMeasurDataComponent, OpportunitiesExportPreviewComponent],
      imports: [ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EmailMeasurDataService,
        ExportOpportunitiesService,
        { provide: ExportService, useValue: jasmine.createSpyObj('ExportService', ['getSelectedAssessment', 'getSelectedInventory']) },
        { provide: AnalyticsService, useValue: jasmine.createSpyObj('AnalyticsService', ['sendEvent']) },
        { provide: ContactDbService, useValue: { allContacts: [], primaryContact: undefined } }
      ]
    }).compileComponents();

    emailMeasurDataService = TestBed.inject(EmailMeasurDataService);
  });

  describe('include unselected checkbox', () => {
    it('shows for opportunities with an unselected opportunity', () => {
      createComponent(makeOpportunitiesAttachment([true, false]));
      expect(component.showIncludeUnselected).toBeTrue();
      expect(getIncludeUnselectedCheckbox()).not.toBeNull();
    });

    it('hides for opportunities when every opportunity is selected', () => {
      createComponent(makeOpportunitiesAttachment([true, true]));
      expect(component.showIncludeUnselected).toBeFalse();
      expect(getIncludeUnselectedCheckbox()).toBeNull();
    });

    it('hides for non-opportunity attachments', () => {
      createComponent({ itemType: 'assessment', itemName: 'Assessment', itemData: {} });
      expect(component.showIncludeUnselected).toBeFalse();
      expect(getIncludeUnselectedCheckbox()).toBeNull();
    });

    it('starts unchecked', () => {
      createComponent(makeOpportunitiesAttachment([true, false]));
      expect(getIncludeUnselectedCheckbox().checked).toBeFalse();
    });
  });

  describe('opportunities preview', () => {
    function getPreviewHeader(): HTMLElement {
      return fixture.nativeElement.querySelector('form .card-header.preview');
    }

    function getPreviewItems(): NodeListOf<HTMLLIElement> {
      return fixture.nativeElement.querySelectorAll('app-opportunities-export-preview li');
    }

    it('does not show for non-opportunity attachments', () => {
      createComponent({ itemType: 'assessment', itemName: 'Assessment', itemData: {} });
      expect(getPreviewHeader()).toBeNull();
    });

    it('starts collapsed with the included count in the header', () => {
      createComponent(makeOpportunitiesAttachment([true, false, true]));
      expect(getPreviewHeader().textContent).toContain('(2 of 3)');
      expect(getPreviewItems().length).toBe(0);
    });

    it('lists every opportunity when expanded, striking through unselected ones', () => {
      createComponent(makeOpportunitiesAttachment([true, false]));
      getPreviewHeader().click();
      fixture.detectChanges();

      const items: NodeListOf<HTMLLIElement> = getPreviewItems();
      expect(items.length).toBe(2);
      expect(items[0].classList).not.toContain('not-exported');
      expect(items[1].classList).toContain('not-exported');
    });

    it('updates when include unselected is checked', () => {
      createComponent(makeOpportunitiesAttachment([true, false]));
      getPreviewHeader().click();
      getIncludeUnselectedCheckbox().click();
      fixture.detectChanges();

      expect(getPreviewHeader().textContent).toContain('(2 of 2)');
      expect(fixture.nativeElement.querySelectorAll('app-opportunities-export-preview li.not-exported').length).toBe(0);
    });

    it('does not expand or collapse when the checkbox in the header is clicked', () => {
      createComponent(makeOpportunitiesAttachment([true, false]));
      getIncludeUnselectedCheckbox().click();
      fixture.detectChanges();

      expect(component.showOpportunitiesPreview).toBeFalse();
      expect(getPreviewHeader().contains(getIncludeUnselectedCheckbox())).toBeTrue();
    });
  });

  describe('opportunities attachment', () => {
    beforeEach(() => {
      // * the email form requires a recipient before setEmailData builds the attachment
      createComponent(makeOpportunitiesAttachment([true, false]));
      component.emailDataForm.controls.emailTo.setValue('user@example.com');
      component.save();
    });

    it('includes only selected opportunities by default', () => {
      expect(getAttachment().opportunitySheets.length).toBe(1);
    });

    it('includes unselected opportunities when the checkbox is checked', () => {
      const checkbox: HTMLInputElement = getIncludeUnselectedCheckbox();
      checkbox.click();
      fixture.detectChanges();

      const attachment: ImportExportOpportunities = getAttachment();
      expect(attachment.opportunitySheets.length).toBe(2);
      expect(attachment.opportunitySheets[1].selected).toBeFalse();
    });

    it('drops unselected opportunities again when the checkbox is unchecked', () => {
      const checkbox: HTMLInputElement = getIncludeUnselectedCheckbox();
      checkbox.click();
      checkbox.click();
      fixture.detectChanges();

      expect(getAttachment().opportunitySheets.length).toBe(1);
    });
  });
});
