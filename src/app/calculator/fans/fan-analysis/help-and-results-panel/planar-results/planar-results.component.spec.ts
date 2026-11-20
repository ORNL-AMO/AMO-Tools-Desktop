import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlanarResultsComponent } from './planar-results.component';
import { FanAnalysisService } from '../../fan-analysis.service';
import { PlaneDataFormService } from '../../fan-analysis-form/plane-data-form/plane-data-form.service';
import { Fan203Inputs, PlaneResult, PlaneResults } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Pipe({ name: 'sigFigs', standalone: false })
class SigFigsStubPipe implements PipeTransform {
  transform(value: number): string {
    return String(value);
  }
}

function makeSettings(fanFlowRate: string = 'ft3/min'): Settings {
  return {
    unitsOfMeasure: 'Imperial',
    fanFlowRate: fanFlowRate,
    fanPressureMeasurement: 'inH2o',
    densityMeasurement: 'lbscf',
    fanTemperatureMeasurement: 'F',
    fanBarometricPressure: 'inHg',
  } as Settings;
}

function makePlaneResult(base: number): PlaneResult {
  return {
    gasDensity: base + 1,
    gasTotalPressure: base + 2,
    gasVelocity: base + 3,
    gasVelocityPressure: base + 4,
    gasVolumeFlowRate: base + 5,
    staticPressure: base + 6,
  };
}

function makePlaneResults(): PlaneResults {
  return {
    FlowTraverse: makePlaneResult(100),
    AddlTraversePlanes: [makePlaneResult(200), makePlaneResult(300)],
    InletMstPlane: makePlaneResult(400),
    FanInletFlange: makePlaneResult(500),
    OutletMstPlane: makePlaneResult(600),
    FanOrEvaseOutletFlange: makePlaneResult(700),
  };
}

function makePlane() {
  return { area: 1, dryBulbTemp: 2, staticPressure: 3, barometricPressure: 4 };
}

function makeInputData(traversePlanes: number = 1, upDownStream: string = 'Upstream'): Fan203Inputs {
  return {
    FanRatedInfo: { traversePlanes: traversePlanes, upDownStream: upDownStream },
    PlaneData: {
      FlowTraverse: makePlane(),
      AddlTraversePlanes: [makePlane(), makePlane()],
      InletMstPlane: makePlane(),
      FanInletFlange: makePlane(),
      OutletMstPlane: makePlane(),
      FanEvaseOrOutletFlange: makePlane(),
    },
  } as unknown as Fan203Inputs;
}

const ROW_ORDER_CASES: Array<{ traversePlanes: number, upDownStream: string, rows: string[] }> = [
  { traversePlanes: 1, upDownStream: 'Upstream', rows: ['3a', '4', '1', '5', '2'] },
  { traversePlanes: 2, upDownStream: 'Upstream', rows: ['3a', '3b', '4', '1', '5', '2'] },
  { traversePlanes: 3, upDownStream: 'Upstream', rows: ['3a', '3b', '3c', '4', '1', '5', '2'] },
  { traversePlanes: 1, upDownStream: 'Downstream', rows: ['3a', '4', '1', '2', '5'] },
  { traversePlanes: 3, upDownStream: 'Downstream', rows: ['3a', '3b', '3c', '4', '1', '2', '5'] },
];

const FULL_ONLY_HEADERS = ['Plane Description', 'Planar Area', 'Dry Bulb Temp', 'Barometric Pressure'];

describe('PlanarResultsComponent', () => {
  let component: PlanarResultsComponent;
  let fixture: ComponentFixture<PlanarResultsComponent>;
  let fanAnalysisService: jasmine.SpyObj<FanAnalysisService>;
  let planeDataFormService: Partial<PlaneDataFormService>;

  async function setup(options: { inAssessmentModal?: boolean, planeResults?: PlaneResults, inputData?: Fan203Inputs, settings?: Settings } = {}) {
    fanAnalysisService = jasmine.createSpyObj('FanAnalysisService', ['getPlaneResults']);
    fanAnalysisService.getResults = new BehaviorSubject<boolean>(true);
    fanAnalysisService.stepTab = new BehaviorSubject<string>('fan-info');
    fanAnalysisService.inAssessmentModal = options.inAssessmentModal ?? false;
    fanAnalysisService.pressureCalcResultType = 'static';
    fanAnalysisService.inputData = options.inputData ?? makeInputData();
    fanAnalysisService.getPlaneResults.and.returnValue('planeResults' in options ? options.planeResults : makePlaneResults());
    planeDataFormService = { planeStep: new BehaviorSubject<string>('plane-info') };

    await TestBed.configureTestingModule({
      declarations: [PlanarResultsComponent, SettingsLabelStubPipe, SigFigsStubPipe],
      providers: [
        { provide: FanAnalysisService, useValue: fanAnalysisService },
        { provide: PlaneDataFormService, useValue: planeDataFormService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanarResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', options.settings ?? makeSettings());
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  function dataTable(): HTMLTableElement {
    const tables = Array.from(fixture.nativeElement.querySelectorAll('table') as NodeListOf<HTMLTableElement>);
    return tables.find(table => table.querySelector('td')?.textContent.trim() === 'Plane #');
  }

  function headerCells(): string[] {
    return Array.from(dataTable().querySelectorAll('tr')[0].querySelectorAll(':scope > td') as NodeListOf<HTMLElement>)
      .map(td => td.textContent.trim());
  }

  function rowLabels(): string[] {
    return Array.from(dataTable().querySelectorAll('tr')).slice(1)
      .map(row => row.querySelector('td').textContent.trim());
  }

  function rowCells(label: string): string[] {
    const row = Array.from(dataTable().querySelectorAll('tr'))
      .find(tr => tr.querySelector('td').textContent.trim() === label);
    return Array.from(row.querySelectorAll('td') as NodeListOf<HTMLElement>).map(td => td.textContent.trim());
  }

  function assessmentBlock(): HTMLElement {
    return query('.btn-group')?.parentElement ?? null;
  }

  function assessmentCell(selector: string): string {
    return assessmentBlock().querySelector(selector).textContent.trim();
  }

  describe('initialization', () => {
    beforeEach(async () => {
      await setup();
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('reads inAssessmentModal from the fan analysis service', () => {
      expect(component.inAssessmentModal).toBeFalse();
    });

    it('gets plane results with the current settings', () => {
      expect(fanAnalysisService.getPlaneResults).toHaveBeenCalledWith(component.settings);
    });

    it('assigns inputs and planeResults', () => {
      expect(component.inputs).toBe(fanAnalysisService.inputData);
      expect(component.planeResults).toEqual(makePlaneResults());
    });

    it('takes stepTab and planeStep from the services', () => {
      expect(component.stepTab).toBe('fan-info');
      expect(component.planeStep).toBe('plane-info');
    });
  });

  describe('calculation triggers', () => {
    beforeEach(async () => {
      await setup();
    });

    it('renders updated results when getResults fires again', () => {
      const updated = makePlaneResults();
      updated.FlowTraverse.gasDensity = 999;
      fanAnalysisService.getPlaneResults.and.returnValue(updated);
      fanAnalysisService.getResults.next(true);
      fixture.detectChanges();
      expect(rowCells('3a')[1]).toBe('999');
    });

    it('setPressureCalcType stores the type on the service and requests results', () => {
      fanAnalysisService.getPlaneResults.calls.reset();
      component.setPressureCalcType('total');
      expect(fanAnalysisService.pressureCalcResultType).toBe('total');
      expect(fanAnalysisService.getPlaneResults).toHaveBeenCalledTimes(1);
    });
  });

  describe('result state visibility', () => {
    it('shows the incomplete-data message and no table when there are no results', async () => {
      await setup({ planeResults: undefined });
      expect(query('.alert-info')).not.toBeNull();
      expect(query('.alert-danger')).toBeNull();
      expect(dataTable()).toBeUndefined();
    });

    it('shows the error message and no data table when results have an error', async () => {
      await setup({ planeResults: { error: true } });
      expect(query('.alert-danger')).not.toBeNull();
      expect(query('.alert-info')).toBeNull();
      expect(dataTable()).toBeUndefined();
    });

    it('shows the data table and no messages when results are valid', async () => {
      await setup();
      expect(dataTable()).toBeDefined();
      expect(query('.alert-danger')).toBeNull();
      expect(query('.alert-info')).toBeNull();
    });
  });

  describe('plane rows', () => {
    ROW_ORDER_CASES.forEach(({ traversePlanes, upDownStream, rows }) => {
      it(`renders rows ${rows.join(', ')} for ${traversePlanes} traverse plane(s), ${upDownStream}`, async () => {
        await setup({ inputData: makeInputData(traversePlanes, upDownStream) });
        expect(rowLabels()).toEqual(rows);
      });
    });

    it('renders plane result values in the row cells', async () => {
      await setup();
      expect(rowCells('1')).toEqual(['1', '501', '505', '503', '506', '504', '502']);
    });
  });

  describe('showFull columns', () => {
    beforeEach(async () => {
      await setup();
    });

    it('hides the full-detail columns by default', () => {
      const headers = headerCells();
      FULL_ONLY_HEADERS.forEach(header => {
        expect(headers.some(cell => cell.startsWith(header))).toBeFalse();
      });
      expect(rowCells('3a').length).toBe(7);
    });

    it('shows the full-detail columns when showFull is true', () => {
      component.showFull = true;
      fixture.detectChanges();
      const headers = headerCells();
      FULL_ONLY_HEADERS.forEach(header => {
        expect(headers.some(cell => cell.startsWith(header))).toBeTrue();
      });
      expect(rowCells('3a').length).toBe(11);
      expect(rowCells('3a')[1]).toBe('Flow Traverse');
    });
  });

  describe('unit labels', () => {
    it('shows imperial area and velocity units for ft3/min', async () => {
      await setup({ settings: makeSettings('ft3/min') });
      component.showFull = true;
      fixture.detectChanges();
      const headers = headerCells();
      expect(headers.find(cell => cell.startsWith('Planar Area'))).toContain('ft2');
      expect(headers.find(cell => cell.startsWith('Planar Area'))).not.toContain('m2');
      expect(headers.find(cell => cell.startsWith('Gas Velocity'))).toContain('ft/min');
      expect(headers.find(cell => cell.startsWith('Gas Velocity'))).not.toContain('m/s');
    });

    it('shows metric area and velocity units for m3/s', async () => {
      await setup({ settings: makeSettings('m3/s') });
      component.showFull = true;
      fixture.detectChanges();
      const headers = headerCells();
      expect(headers.find(cell => cell.startsWith('Planar Area'))).toContain('m2');
      expect(headers.find(cell => cell.startsWith('Planar Area'))).not.toContain('ft2');
      expect(headers.find(cell => cell.startsWith('Gas Velocity'))).toContain('m/s');
      expect(headers.find(cell => cell.startsWith('Gas Velocity'))).not.toContain('ft/min');
    });

    it('shows no area or velocity unit for other flow rate units', async () => {
      await setup({ settings: makeSettings('gpm') });
      component.showFull = true;
      fixture.detectChanges();
      const headers = headerCells();
      expect(headers.find(cell => cell.startsWith('Planar Area'))).toBe('Planar Area');
      expect(headers.find(cell => cell.startsWith('Gas Velocity'))).toBe('Gas Velocity');
    });
  });

  describe('assessment modal block', () => {
    it('hides the assessment block and shows the table label outside the assessment modal', async () => {
      await setup({ inAssessmentModal: false });
      expect(assessmentBlock()).toBeNull();
      expect(query('label.group-label').textContent.trim()).toBe('Plane Data Table');
    });

    it('shows the assessment block and hides the table label in the assessment modal', async () => {
      await setup({ inAssessmentModal: true });
      expect(assessmentBlock()).not.toBeNull();
      const labels = Array.from(fixture.nativeElement.querySelectorAll('label.group-label') as NodeListOf<HTMLElement>)
        .map(label => label.textContent.trim());
      expect(labels).toEqual(['Assessment Data']);
    });

    it('hides the assessment block in the modal when there are no results', async () => {
      await setup({ inAssessmentModal: true, planeResults: undefined });
      expect(assessmentBlock()).toBeNull();
    });

    it('shows the assessment block in the modal even when results have an error', async () => {
      await setup({ inAssessmentModal: true, planeResults: { error: true, FanInletFlange: makePlaneResult(500), FanOrEvaseOutletFlange: makePlaneResult(700) } });
      expect(assessmentBlock()).not.toBeNull();
      expect(dataTable()).toBeUndefined();
    });

    it('shows static inlet and outlet pressures when the calc type is static', async () => {
      await setup({ inAssessmentModal: true });
      expect(assessmentBlock().querySelectorAll('td.inlet-pressure').length).toBe(1);
      expect(assessmentBlock().querySelectorAll('td.outlet-pressure').length).toBe(1);
      expect(assessmentCell('td.inlet-pressure')).toContain('506');
      expect(assessmentCell('td.outlet-pressure')).toContain('706');
    });

    it('shows total inlet and outlet pressures when the calc type is total', async () => {
      await setup({ inAssessmentModal: true });
      component.setPressureCalcType('total');
      fixture.detectChanges();
      expect(assessmentBlock().querySelectorAll('td.inlet-pressure').length).toBe(1);
      expect(assessmentBlock().querySelectorAll('td.outlet-pressure').length).toBe(1);
      expect(assessmentCell('td.inlet-pressure')).toContain('502');
      expect(assessmentCell('td.outlet-pressure')).toContain('702');
    });

    it('shows neither pressure cell for an unknown calc type', async () => {
      await setup({ inAssessmentModal: true });
      fanAnalysisService.pressureCalcResultType = 'other';
      fixture.detectChanges();
      expect(assessmentBlock().querySelectorAll('td.inlet-pressure').length).toBe(0);
      expect(assessmentBlock().querySelectorAll('td.outlet-pressure').length).toBe(0);
    });
  });

  describe('destroy', () => {
    it('stops requesting results and tracking tabs after destroy', async () => {
      await setup();
      fanAnalysisService.getPlaneResults.calls.reset();
      fixture.destroy();
      fanAnalysisService.getResults.next(true);
      fanAnalysisService.stepTab.next('plane-data');
      planeDataFormService.planeStep.next('1');
      expect(fanAnalysisService.getPlaneResults).not.toHaveBeenCalled();
      expect(component.stepTab).toBe('fan-info');
      expect(component.planeStep).toBe('plane-info');
    });
  });
});
