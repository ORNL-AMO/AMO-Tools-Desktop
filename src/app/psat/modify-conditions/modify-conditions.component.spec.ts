import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModifyConditionsComponent } from './modify-conditions.component';
import { AssessmentService } from '../../dashboard/assessment.service';
import { CompareService } from '../compare.service';
import { PsatTabService } from '../psat-tab.service';
import { PsatService } from '../psat.service';

describe('ModifyConditionsComponent', () => {
  let component: ModifyConditionsComponent;
  let fixture: ComponentFixture<ModifyConditionsComponent>;

  const mockPsat: any = {
    inputs: {},
    modifications: [
      { psat: { name: 'Mod 1', inputs: {} }, notes: {} },
    ],
  };
  const mockSettings: any = { unitsOfMeasure: 'Imperial' };
  const mockAssessment: any = { id: 1, psat: mockPsat };

  beforeEach(async () => {
    const assessmentServiceSpy = jasmine.createSpyObj('AssessmentService', ['getSubTab']);
    assessmentServiceSpy.getSubTab.and.returnValue(null);

    const compareServiceSpy = jasmine.createSpyObj('CompareService', [], {
      openNewModal: new BehaviorSubject<boolean>(false),
    });

    const psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], {
      modifyConditionsTab: new BehaviorSubject<string>('pump-fluid'),
    });

    const psatServiceSpy = jasmine.createSpyObj('PsatService', [], {
      modalOpen: new BehaviorSubject<boolean>(false),
    });

    await TestBed.configureTestingModule({
      declarations: [ModifyConditionsComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        ChangeDetectorRef,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyConditionsComponent);
    component = fixture.componentInstance;
    component.psat = JSON.parse(JSON.stringify(mockPsat));
    component.settings = mockSettings;
    component.assessment = mockAssessment;
    component.modificationIndex = 0;
    component.modificationExists = true;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('settings guard', () => {
    it('renders the modify-conditions container when settings is set', () => {
      expect(fixture.nativeElement.querySelector('.modify-conditions')).not.toBeNull();
    });

    it('hides the modify-conditions container when settings is falsy', () => {
      component.settings = null;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.modify-conditions')).toBeNull();
    });
  });

  describe('modifyTab conditionals', () => {
    it('shows pump-operations when modifyTab is "operations"', () => {
      component.modifyTab = 'operations';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-pump-operations')).not.toBeNull();
    });

    it('shows pump-fluid when modifyTab is "pump-fluid"', () => {
      component.modifyTab = 'pump-fluid';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-pump-fluid')).not.toBeNull();
    });

    it('shows motor when modifyTab is "motor"', () => {
      component.modifyTab = 'motor';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-motor')).not.toBeNull();
    });

    it('shows field-data when modifyTab is "field-data"', () => {
      component.modifyTab = 'field-data';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-field-data')).not.toBeNull();
    });
  });

  describe('modificationExists conditionals', () => {
    it('shows help-panel when modificationExists is true', () => {
      component.modificationExists = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-help-panel')).not.toBeNull();
    });

    it('hides help-panel and shows add-modification button when modificationExists is false', () => {
      component.modificationExists = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-help-panel')).toBeNull();
    });
  });
});
