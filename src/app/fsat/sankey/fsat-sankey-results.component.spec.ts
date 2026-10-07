import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FsatSankeyResultsComponent } from './fsat-sankey-results.component';
import { FsatService } from '../fsat.service';
import { FSAT, Modification } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

describe('FsatSankeyResultsComponent', () => {
  let component: FsatSankeyResultsComponent;
  let fixture: ComponentFixture<FsatSankeyResultsComponent>;
  let sankeyOptionsSubject: BehaviorSubject<Array<{ name: string, fsat: FSAT }>>;
  let selectedSankeyFsatOptionSubject: BehaviorSubject<{ fsat: FSAT, name: string }>;
  let sankeyLabelStyleSubject: BehaviorSubject<string>;
  let fsatServiceStub: any;

  beforeEach(async () => {
    const modification: Modification = { id: 'm1', fsat: { name: 'Scenario 1' } as FSAT } as Modification;
    const fsat: FSAT = { name: 'baseline', modifications: [modification], setupDone: true } as FSAT;
    const fsatOptions = [{ name: 'Baseline', fsat: fsat }, { name: 'Scenario 1', fsat: modification.fsat }];

    sankeyOptionsSubject = new BehaviorSubject(fsatOptions);
    selectedSankeyFsatOptionSubject = new BehaviorSubject(fsatOptions[0]);
    sankeyLabelStyleSubject = new BehaviorSubject('both');

    fsatServiceStub = {
      settings: new BehaviorSubject<Settings>({ id: 1 } as Settings),
      containerHeight: new BehaviorSubject<number>(500),
      sankeyOptions: sankeyOptionsSubject,
      selectedSankeyFsatOption: selectedSankeyFsatOptionSubject,
      sankeyLabelStyle: sankeyLabelStyleSubject,
      showSankeyLabelOptions: new BehaviorSubject<boolean>(true),
      setSelectedSankeyFsatOption: (option: { fsat: FSAT, name: string }) => selectedSankeyFsatOptionSubject.next(option),
      setSankeyLabelStyle: (style: string) => sankeyLabelStyleSubject.next(style),
    };

    await TestBed.configureTestingModule({
      declarations: [FsatSankeyResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: FsatService, useValue: fsatServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(FsatSankeyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('mirrors the service-provided Baseline + modification options and selection', () => {
    expect(component.fsatOptions.map(o => o.name)).toEqual(['Baseline', 'Scenario 1']);
    expect(component.selectedSankeyFsatOption.name).toBe('Baseline');
  });

  it('preserves a user selection across remount (fresh subscribe with no new initSankeyList call)', () => {
    component.selectSankeyOption(component.fsatOptions[1]);
    expect(selectedSankeyFsatOptionSubject.getValue().name).toBe('Scenario 1');

    // Simulate the router destroying/recreating the component (tab-to-tab navigation): a fresh
    // instance just resubscribes to the same still-selected service state.
    const remountedFixture = TestBed.createComponent(FsatSankeyResultsComponent);
    remountedFixture.detectChanges();
    expect(remountedFixture.componentInstance.selectedSankeyFsatOption.name).toBe('Scenario 1');
  });

  it('resets to Baseline only when the service recomputes the list (a real edit), not on remount', () => {
    component.selectSankeyOption(component.fsatOptions[1]);
    selectedSankeyFsatOptionSubject.next(sankeyOptionsSubject.getValue()[0]);
    expect(component.selectedSankeyFsatOption.name).toBe('Baseline');
  });

  it('setSankeyLabelStyle updates the label style via the service', () => {
    component.setSankeyLabelStyle('power');
    expect(component.sankeyLabelStyle).toBe('power');
  });
});
