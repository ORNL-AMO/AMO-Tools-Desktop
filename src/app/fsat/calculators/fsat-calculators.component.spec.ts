import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FsatCalculatorsComponent } from './fsat-calculators.component';
import { FsatService } from '../fsat.service';
import { FSAT } from '../../shared/models/fans';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';

describe('FsatCalculatorsComponent', () => {
  let component: FsatCalculatorsComponent;
  let fixture: ComponentFixture<FsatCalculatorsComponent>;

  beforeEach(async () => {
    const fsatServiceStub: any = {
      fsat: new BehaviorSubject<FSAT>({ modifications: [] } as FSAT),
      assessment: new BehaviorSubject<Assessment>({ id: 1, type: 'FSAT' } as Assessment),
      settings: new BehaviorSubject<Settings>({ id: 1 } as Settings),
      calculatorTab: new BehaviorSubject<string>('fan-efficiency'),
      containerHeight: new BehaviorSubject<number>(500),
    };

    await TestBed.configureTestingModule({
      declarations: [FsatCalculatorsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: FsatService, useValue: fsatServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(FsatCalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders once FsatService is seeded and tracks the active calculator tab', () => {
    expect(component.assessment.id).toBe(1);
    expect(component.calcTab).toBe('fan-efficiency');
  });
});
