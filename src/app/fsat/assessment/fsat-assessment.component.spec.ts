import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { FsatAssessmentComponent } from './fsat-assessment.component';
import { FsatService } from '../fsat.service';
import { FSAT } from '../../shared/models/fans';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';

describe('FsatAssessmentComponent', () => {
  let component: FsatAssessmentComponent;
  let fixture: ComponentFixture<FsatAssessmentComponent>;
  let fsatServiceStub: any;

  const fsat: FSAT = { modifications: [] } as FSAT;

  beforeEach(async () => {
    fsatServiceStub = {
      fsat: new BehaviorSubject<FSAT>(fsat),
      assessment: new BehaviorSubject<Assessment>({ id: 1, type: 'FSAT' } as Assessment),
      settings: new BehaviorSubject<Settings>({ id: 1 } as Settings),
      assessmentTab: new BehaviorSubject<string>('explore-opportunities'),
      containerHeight: new BehaviorSubject<number>(500),
      modificationIndex: new BehaviorSubject<number>(undefined),
      modificationExists: new BehaviorSubject<boolean>(false),
      openModificationModal: new BehaviorSubject<boolean>(false),
      setFsat: jasmine.createSpy('setFsat'),
      addNewModRequested: new Subject<{ exploreOpportunities: boolean }>(),
    };

    await TestBed.configureTestingModule({
      declarations: [FsatAssessmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: FsatService, useValue: fsatServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(FsatAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders once FsatService is seeded', () => {
    expect(component.fsat).toBe(fsat);
    expect(component.assessmentTab).toBe('explore-opportunities');
  });

  it('routes a saveFsat call through FsatService.setFsat', () => {
    const newFsat: FSAT = { modifications: [] } as FSAT;
    component.saveFsat(newFsat);
    expect(fsatServiceStub.setFsat).toHaveBeenCalledWith(newFsat);
  });

  it('addNewMod requests a new modification flagged for the active sub-tab', (done) => {
    fsatServiceStub.addNewModRequested.subscribe((payload: { exploreOpportunities: boolean }) => {
      expect(payload).toEqual({ exploreOpportunities: true });
      done();
    });
    component.addNewMod();
  });
});
