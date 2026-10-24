import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FsatBaselineComponent } from './fsat-baseline.component';
import { FsatService } from '../fsat.service';
import { FSAT, FanMotor } from '../../shared/models/fans';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';

describe('FsatBaselineComponent', () => {
  let component: FsatBaselineComponent;
  let fixture: ComponentFixture<FsatBaselineComponent>;
  let fsatServiceStub: any;

  const fsat: FSAT = { fanMotor: {}, modifications: [] } as FSAT;

  beforeEach(async () => {
    fsatServiceStub = {
      fsat: new BehaviorSubject<FSAT>(fsat),
      assessment: new BehaviorSubject<Assessment>({ id: 1, type: 'FSAT' } as Assessment),
      settings: new BehaviorSubject<Settings>({ id: 1 } as Settings),
      stepTab: new BehaviorSubject<string>('baseline'),
      containerHeight: new BehaviorSubject<number>(500),
      modificationIndex: new BehaviorSubject<number>(undefined),
      modalOpen: new BehaviorSubject<boolean>(false),
      showUpdateUnitsModal: new BehaviorSubject<{ show: boolean }>({ show: false }),
      smallScreenTab: new BehaviorSubject<string>('form'),
      updateFsatProperty: jasmine.createSpy('updateFsatProperty'),
      updateSettings: jasmine.createSpy('updateSettings'),
      setFsat: jasmine.createSpy('setFsat'),
    };

    await TestBed.configureTestingModule({
      declarations: [FsatBaselineComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: FsatService, useValue: fsatServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(FsatBaselineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders once FsatService is seeded', () => {
    expect(component.fsat).toBe(fsat);
    expect(component.stepTab).toBe('baseline');
  });

  it('routes a fan motor save through FsatService.updateFsatProperty', () => {
    const newFanMotor: FanMotor = { motorRatedPower: 50 } as FanMotor;
    component.saveFanMotor(newFanMotor);
    expect(fsatServiceStub.updateFsatProperty).toHaveBeenCalledWith('fanMotor', newFanMotor);
  });

  it('opening the update-units modal goes through FsatService.showUpdateUnitsModal', () => {
    const oldSettings: Settings = { id: 2 } as Settings;
    component.initUpdateUnitsModal(oldSettings);
    expect(fsatServiceStub.showUpdateUnitsModal.getValue()).toEqual({ show: true, oldSettings });
  });
});
