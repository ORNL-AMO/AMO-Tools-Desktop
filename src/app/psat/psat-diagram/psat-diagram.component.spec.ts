import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PsatDiagramComponent } from './psat-diagram.component';
import { PsatService } from '../psat.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PSAT, PsatInputs, PsatOutputs, Modification } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS: Settings = {
  unitsOfMeasure: 'Imperial',
  powerMeasurement: 'hp',
  flowMeasurement: 'gpm',
  distanceMeasurement: 'ft',
} as Settings;

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    pump_style: 0,
    pump_rated_speed: 1780,
    operating_hours: 8760,
    flow_rate: 1000,
    head: 100,
    fluidType: 'Water',
    fluidTemperature: 60,
    specific_gravity: 1.0,
    kinematic_viscosity: 1.0,
    motor_rated_power: 200,
    motor_rated_fla: 225,
    motor_rated_voltage: 460,
    ...overrides,
  };
}

function makeOutputs(overrides: Partial<PsatOutputs> = {}): PsatOutputs {
  return {
    motor_efficiency: 92.5,
    motor_power: 150.2,
    motor_current: 180,
    pump_efficiency: 75.3,
    ...overrides,
  };
}

function makeModification(name = 'Modification 1', inputOverrides: Partial<PsatInputs> = {}): Modification {
  return {
    id: 'mod-1',
    psat: { name, inputs: makePsatInputs(inputOverrides) },
  } as Modification;
}

function makePsat(inputs?: PsatInputs, modifications: Modification[] = []): PSAT {
  return {
    name: 'Baseline',
    inputs,
    modifications,
  } as PSAT;
}

describe('PsatDiagramComponent', () => {
  let component: PsatDiagramComponent;
  let fixture: ComponentFixture<PsatDiagramComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['getPumpStyleFromEnum', 'resultsExisting', 'resultsModified']);
    psatServiceSpy.getPumpStyleFromEnum.and.returnValue('Centrifugal');
    psatServiceSpy.resultsExisting.and.returnValue(makeOutputs());
    psatServiceSpy.resultsModified.and.returnValue(makeOutputs({ motor_efficiency: 88.1 }));

    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);
    convertUnitsServiceSpy.getUnit.and.returnValue({ unit: { name: { display: 'gpm' } } });

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PsatDiagramComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PsatDiagramComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      component.psat = makePsat(makePsatInputs());
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('builds a single baseline result entry when there are no modifications', () => {
      const psat = makePsat(makePsatInputs());
      component.psat = psat;
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      expect(component.resultsArr.length).toBe(1);
      expect(component.resultsArr[0].name).toBe('Baseline');
      expect(component.resultsArr[0].psat).toBe(psat);
    });

    it('assigns the baseline results onto psat.outputs', () => {
      const psat = makePsat(makePsatInputs());
      const baselineOutputs = makeOutputs();
      psatServiceSpy.resultsExisting.and.returnValue(baselineOutputs);
      component.psat = psat;
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      expect(psat.outputs).toBe(baselineOutputs);
      expect(component.resultsArr[0].output).toBe(baselineOutputs);
    });

    it('adds a result entry per modification, using modified results', () => {
      const modification = makeModification('Mod A');
      component.psat = makePsat(makePsatInputs(), [modification]);
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      expect(component.resultsArr.length).toBe(2);
      expect(component.resultsArr[1].name).toBe('Mod A');
      expect(component.resultsArr[1].psat).toBe(modification.psat);
      expect(psatServiceSpy.resultsModified).toHaveBeenCalledWith(modification.psat.inputs, MOCK_SETTINGS);
    });

    it('leaves resultsArr empty when psat.inputs is missing', () => {
      component.psat = makePsat(undefined);
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      expect(component.resultsArr.length).toBe(0);
      expect(psatServiceSpy.resultsExisting).not.toHaveBeenCalled();
    });

    it('leaves resultsArr empty when settings is missing', () => {
      // Template reads settings.powerMeasurement unconditionally, so exercise ngOnInit directly
      // rather than through fixture.detectChanges() to avoid an unrelated render-time TypeError.
      component.psat = makePsat(makePsatInputs());
      component.settings = undefined;
      component.ngOnInit();

      expect(component.resultsArr.length).toBe(0);
    });
  });

  describe('getPumpType / getUnit', () => {
    it('delegates getPumpType to psatService.getPumpStyleFromEnum', () => {
      expect(component.getPumpType(3)).toBe('Centrifugal');
      expect(psatServiceSpy.getPumpStyleFromEnum).toHaveBeenCalledWith(3);
    });

    it('delegates getUnit to convertUnitsService and returns the display name', () => {
      expect(component.getUnit('gpm')).toBe('gpm');
      expect(convertUnitsServiceSpy.getUnit).toHaveBeenCalledWith('gpm');
    });
  });

  describe('calculation triggers & output rendering', () => {
    it('renders motor efficiency from the baseline results service call', () => {
      psatServiceSpy.resultsExisting.and.returnValue(makeOutputs({ motor_efficiency: 92.5 }));
      component.psat = makePsat(makePsatInputs());
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      const efficiencyCells = fixture.nativeElement.querySelectorAll('.data-cell');
      expect(Array.from(efficiencyCells as NodeListOf<HTMLElement>).some((cell) => cell.textContent.includes('92.5'))).toBeTrue();
    });

    it('renders updated results when a different psat input is provided', () => {
      psatServiceSpy.resultsExisting.and.returnValue(makeOutputs({ motor_efficiency: 50 }));
      component.psat = makePsat(makePsatInputs());
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();
      expect(component.resultsArr[0].output.motor_efficiency).toBe(50);

      psatServiceSpy.resultsExisting.and.returnValue(makeOutputs({ motor_efficiency: 70 }));
      component.ngOnInit();
      expect(component.resultsArr[0].output.motor_efficiency).toBe(70);
    });
  });

  describe('template rendering', () => {
    it('renders no result columns when resultsArr is empty', () => {
      component.psat = makePsat(undefined);
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.psat-column-name').length).toBe(0);
    });

    it('renders one result column for the baseline when there are no modifications', () => {
      component.psat = makePsat(makePsatInputs());
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      const columnHeaders = fixture.nativeElement.querySelectorAll('.psat-column-name');
      expect(columnHeaders.length).toBe(1);
      expect(columnHeaders[0].textContent).toContain('Baseline');
    });

    it('renders one result column per modification in addition to the baseline', () => {
      component.psat = makePsat(makePsatInputs(), [makeModification('Mod A'), makeModification('Mod B')]);
      component.settings = MOCK_SETTINGS;
      fixture.detectChanges();

      const columnHeaders = fixture.nativeElement.querySelectorAll('.psat-column-name');
      expect(columnHeaders.length).toBe(3);
      expect(columnHeaders[1].textContent).toContain('Mod A');
      expect(columnHeaders[2].textContent).toContain('Mod B');
    });
  });
});
