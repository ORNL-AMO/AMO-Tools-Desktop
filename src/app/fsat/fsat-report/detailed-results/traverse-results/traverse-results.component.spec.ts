import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TraverseResultsComponent } from './traverse-results.component';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { FSAT, FsatOutput, Plane, PlaneData, PlaneResult, PlaneResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

function makePlaneResult(seed: number): PlaneResult {
  return {
    gasDensity: seed,
    gasTotalPressure: seed + 1,
    gasVelocity: seed + 2,
    gasVelocityPressure: seed + 3,
    gasVolumeFlowRate: seed + 4,
    staticPressure: seed + 5,
  };
}

function makePlane(seed: number): Plane {
  return { area: seed, dryBulbTemp: seed + 1, barometricPressure: seed + 2, staticPressure: seed + 3 } as Plane;
}

function makePlaneResults(overrides: Partial<PlaneResults> = {}): PlaneResults {
  return {
    FlowTraverse: makePlaneResult(1),
    AddlTraversePlanes: [makePlaneResult(2), makePlaneResult(3)],
    InletMstPlane: makePlaneResult(4),
    FanInletFlange: makePlaneResult(5),
    OutletMstPlane: makePlaneResult(6),
    FanOrEvaseOutletFlange: makePlaneResult(7),
    error: false,
    ...overrides,
  };
}

function makeFsat(planeResults: PlaneResults | undefined, traversePlanes = 1, upDownStream = 'Upstream'): FSAT {
  const planeData = {
    FlowTraverse: makePlane(1),
    AddlTraversePlanes: [makePlane(2), makePlane(3)],
    InletMstPlane: makePlane(4),
    FanInletFlange: makePlane(5),
    OutletMstPlane: makePlane(6),
    FanEvaseOrOutletFlange: makePlane(7),
  } as PlaneData;
  return {
    outputs: { planeResults } as FsatOutput,
    fan203InputsForPlaneResults: {
      FanRatedInfo: { traversePlanes, upDownStream },
      PlaneData: planeData,
    },
  } as FSAT;
}

function makeSettings(fanFlowRate: string): Settings {
  return {
    fanFlowRate,
    densityMeasurement: 'lbscf',
    fanTemperatureMeasurement: 'F',
    fanPressureMeasurement: 'inH2o',
    fanBarometricPressure: 'inHg',
  } as Settings;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('TraverseResultsComponent', () => {
  let component: TraverseResultsComponent;
  let fixture: ComponentFixture<TraverseResultsComponent>;

  function render(fsat: FSAT, settings: Settings = makeSettings('ft3/min'), fsatName = 'Baseline') {
    component.fsat = fsat;
    component.settings = settings;
    component.fsatName = fsatName;
    fixture.detectChanges();
  }

  /** "plane # description" for each data row of the plane table (header row excluded). */
  function getPlaneRows(): string[] {
    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')).slice(1) as HTMLElement[];
    return rows.map(row => `${normalize(row.children[0].textContent)} ${normalize(row.children[1].textContent)}`);
  }

  function getHeaderCell(title: string): HTMLElement {
    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr:first-child td'));
    return cells.find(cell => normalize(cell.textContent).startsWith(title));
  }

  beforeEach(async () => {
    const convertUnitsSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);
    convertUnitsSpy.getUnit.and.callFake((unit: string) => ({ unit: { name: { display: unit } } }));

    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [TraverseResultsComponent],
      providers: [{ provide: ConvertUnitsService, useValue: convertUnitsSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TraverseResultsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and takes the plane results from the fsat outputs', () => {
      const planeResults = makePlaneResults();
      render(makeFsat(planeResults));

      expect(component).toBeTruthy();
      expect(component.planeResults).toBe(planeResults);
    });
  });

  describe('template visibility: plane data table', () => {
    it('shows the table titled with the fsat name when plane results are valid', () => {
      render(makeFsat(makePlaneResults()), makeSettings('ft3/min'), 'Mod A');

      expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
      expect(normalize(fixture.nativeElement.querySelector('label').textContent)).toBe('Mod A Plane Data Table');
    });

    it('hides the table when there are no plane results', () => {
      render(makeFsat(undefined));

      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });

    it('hides the table when the plane results contain an error', () => {
      render(makeFsat(makePlaneResults({ error: true })));

      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });
  });

  describe('template visibility: additional traverse plane rows', () => {
    it('shows no additional traverse plane rows for a single traverse plane', () => {
      render(makeFsat(makePlaneResults(), 1));

      expect(getPlaneRows()).toEqual([
        '3a Flow Traverse',
        '4 Inlet Measurement Plane',
        '1 Fan Inlet Flange',
        '5 Outlet Measurement Plane',
        '2 Fan or Evase Outlet Flange',
      ]);
    });

    it('shows only the first additional traverse plane row for two traverse planes', () => {
      render(makeFsat(makePlaneResults(), 2));

      expect(getPlaneRows().slice(0, 2)).toEqual(['3a Flow Traverse', "3b Add'l Traverse Plane 1"]);
      expect(getPlaneRows().some(row => row.startsWith('3c'))).toBeFalse();
    });

    it('shows both additional traverse plane rows for three traverse planes', () => {
      render(makeFsat(makePlaneResults(), 3));

      expect(getPlaneRows().slice(0, 3)).toEqual([
        '3a Flow Traverse',
        "3b Add'l Traverse Plane 1",
        "3c Add'l Traverse Plane 2",
      ]);
    });
  });

  describe('template visibility: outlet measurement plane position', () => {
    it('places the outlet measurement plane before the outlet flange when not downstream', () => {
      render(makeFsat(makePlaneResults(), 1, 'Upstream'));

      const rows = getPlaneRows();
      expect(rows.filter(row => row.endsWith('Outlet Measurement Plane')).length).toBe(1);
      expect(rows.indexOf('5 Outlet Measurement Plane')).toBeLessThan(rows.indexOf('2 Fan or Evase Outlet Flange'));
    });

    it('places the outlet measurement plane after the outlet flange when downstream', () => {
      render(makeFsat(makePlaneResults(), 1, 'Downstream'));

      const rows = getPlaneRows();
      expect(rows.filter(row => row.endsWith('Outlet Measurement Plane')).length).toBe(1);
      expect(rows.indexOf('5 Outlet Measurement Plane')).toBeGreaterThan(rows.indexOf('2 Fan or Evase Outlet Flange'));
    });
  });

  describe('template visibility: flow rate unit labels', () => {
    it('labels planar area and gas velocity in imperial units for ft3/min', () => {
      render(makeFsat(makePlaneResults()), makeSettings('ft3/min'));

      expect(normalize(getHeaderCell('Planar Area').textContent).replace(/ /g, '')).toBe('PlanarAreaft2');
      expect(normalize(getHeaderCell('Gas Velocity').textContent).replace(/ /g, '')).toBe('GasVelocityft/min');
    });

    it('labels planar area and gas velocity in metric units for m3/s', () => {
      render(makeFsat(makePlaneResults()), makeSettings('m3/s'));

      expect(normalize(getHeaderCell('Planar Area').textContent).replace(/ /g, '')).toBe('PlanarAream2');
      expect(normalize(getHeaderCell('Gas Velocity').textContent).replace(/ /g, '')).toBe('GasVelocitym/s');
    });

    it('shows no unit for planar area and gas velocity for other flow rate units', () => {
      render(makeFsat(makePlaneResults()), makeSettings('gpm'));

      expect(normalize(getHeaderCell('Planar Area').textContent).replace(/ /g, '')).toBe('PlanarArea');
      expect(normalize(getHeaderCell('Gas Velocity').textContent).replace(/ /g, '')).toBe('GasVelocity');
    });
  });

  describe('user actions', () => {
    it('copies the plane table text for export', () => {
      render(makeFsat(makePlaneResults()), makeSettings('ft3/min'), 'Baseline');

      component.updateCopyTableString();

      expect(component.copyTableString).toContain('Flow Traverse');
      expect(component.copyTableString).toContain('Fan Inlet Flange');
    });
  });
});
