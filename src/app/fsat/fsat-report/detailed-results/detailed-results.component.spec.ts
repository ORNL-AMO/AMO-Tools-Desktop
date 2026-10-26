import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DetailedResultsComponent } from './detailed-results.component';
import { FanPsychrometricService, FanPsychrometricWarnings } from '../../../calculator/process-cooling/fan-psychrometric/fan-psychrometric.service';
import { FsatReportRollupService } from '../../../report-rollup/fsat-report-rollup.service';
import { FsatCompare } from '../../../report-rollup/report-rollup-models';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { Assessment } from '../../../shared/models/assessment';
import { FSAT, FsatOutput, Modification, PlaneResults, PsychrometricResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

const EM_DASH = '—';

function makePsychrometricResults(overrides: Partial<PsychrometricResults> = {}): PsychrometricResults {
  return {
    dryBulbTemp: 70,
    relativeHumidity: 50,
    wetBulbTemp: 60,
    dewPoint: 55,
    enthalpy: 30,
    gasDensity: 0.075,
    specificVolume: 13,
    barometricPressure: 14.7,
    saturationPressure: 0.36,
    saturatedHumidity: 0.01,
    absolutePressure: 14.5,
    saturationDegree: 0.5,
    humidityRatio: 0.0123,
    ...overrides,
  };
}

function makeFsat(name: string, psychrometric: PsychrometricResults, planeResults?: PlaneResults, modifications?: Modification[]): FSAT {
  return {
    name,
    modifications,
    outputs: { psychrometricResults: psychrometric, planeResults } as FsatOutput,
  } as FSAT;
}

function makeModification(name: string, psychrometric: PsychrometricResults, planeResults?: PlaneResults): Modification {
  return { id: name, fsat: makeFsat(name, psychrometric, planeResults) } as Modification;
}

function makeAssessment(baseline: PsychrometricResults, modifications: Modification[], baselinePlaneResults?: PlaneResults): Assessment {
  return { id: 7, fsat: makeFsat('Baseline', baseline, baselinePlaneResults, modifications) } as Assessment;
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    unitsOfMeasure: 'Imperial',
    fanTemperatureMeasurement: 'F',
    densityMeasurement: 'lbscf',
    fanPressureMeasurement: 'inH2o',
    fanBarometricPressure: 'inHg',
    ...overrides,
  } as Settings;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('DetailedResultsComponent', () => {
  let component: DetailedResultsComponent;
  let fixture: ComponentFixture<DetailedResultsComponent>;
  let psychrometricServiceSpy: jasmine.SpyObj<FanPsychrometricService>;
  let selectedFsats: BehaviorSubject<Array<FsatCompare>>;
  let warningsByResults: Map<PsychrometricResults, Partial<FanPsychrometricWarnings>>;

  function getRows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getRowCells(labelPrefix: string): string[] {
    const row = getRows().find(r => normalize(r.children[0].textContent).startsWith(labelPrefix));
    expect(row).withContext(`row "${labelPrefix}"`).toBeDefined();
    return Array.from(row.children).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function getHeaderTexts(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('thead th')).map((th: HTMLElement) => normalize(th.textContent));
  }

  function getWarningBoxes(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.alert-warning'));
  }

  function render(assessment: Assessment, options: { inRollup?: boolean, settings?: Settings } = {}) {
    component.assessment = assessment;
    component.settings = options.settings ?? makeSettings();
    component.inRollup = options.inRollup ?? false;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    selectedFsats = new BehaviorSubject<Array<FsatCompare>>([]);
    warningsByResults = new Map();

    psychrometricServiceSpy = jasmine.createSpyObj('FanPsychrometricService', ['checkWarnings']);
    psychrometricServiceSpy.checkWarnings.and.callFake((results: PsychrometricResults) => ({
      resultHumidityRatio: undefined,
      resultSaturationPressure: undefined,
      hasResultWarning: false,
      ...warningsByResults.get(results),
    }));

    const convertUnitsSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);
    convertUnitsSpy.getUnit.and.callFake((unit: string) => ({ unit: { name: { display: unit } } }));

    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [DetailedResultsComponent],
      providers: [
        { provide: FanPsychrometricService, useValue: psychrometricServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsSpy },
        {
          provide: FsatReportRollupService,
          useValue: jasmine.createSpyObj('FsatReportRollupService', [], { selectedFsats }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailedResultsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and takes the fsat from the assessment', () => {
      const assessment = makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]);
      render(assessment);

      expect(component).toBeTruthy();
      expect(component.fsat).toBe(assessment.fsat);
    });

    it('checks warnings for the baseline results and for the modifications', () => {
      const baseline = makePsychrometricResults();
      const modResults = makePsychrometricResults();
      render(makeAssessment(baseline, [makeModification('Mod A', modResults)]));

      expect(psychrometricServiceSpy.checkWarnings).toHaveBeenCalledWith(baseline);
      expect(psychrometricServiceSpy.checkWarnings).toHaveBeenCalledWith(modResults);
    });

    it('reads the selected modification for this assessment from the rollup service when in a rollup', () => {
      selectedFsats.next([{ assessmentId: 7, selectedIndex: 0 } as FsatCompare]);
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]), { inRollup: true });

      expect(component.selectedModificationIndex).toBe(0);
    });

    it('ignores the rollup service when not in a rollup', () => {
      selectedFsats.next([{ assessmentId: 7, selectedIndex: 0 } as FsatCompare]);
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]));

      expect(component.selectedModificationIndex).toBeUndefined();
    });
  });

  describe('template visibility: modification columns (ngFor)', () => {
    it('renders one header and value column per modification', () => {
      render(makeAssessment(makePsychrometricResults(), [
        makeModification('Mod A', makePsychrometricResults()),
        makeModification('Mod B', makePsychrometricResults()),
      ]));

      expect(getHeaderTexts()).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
      expect(getRowCells('Relative Humidity').length).toBe(4);
    });

    it('highlights the selected modification header', () => {
      selectedFsats.next([{ assessmentId: 7, selectedIndex: 1 } as FsatCompare]);
      render(makeAssessment(makePsychrometricResults(), [
        makeModification('Mod A', makePsychrometricResults()),
        makeModification('Mod B', makePsychrometricResults()),
      ]), { inRollup: true });

      const selected = Array.from(fixture.nativeElement.querySelectorAll('thead th.selected-modification')) as HTMLElement[];
      expect(selected.map(th => normalize(th.textContent))).toEqual(['Mod B']);
    });
  });

  describe('template visibility: psychrometric values or em dash', () => {
    const rows: Array<{ label: string, key: keyof PsychrometricResults, baseline: string, modification: string }> = [
      { label: 'Dry Bulb', key: 'dryBulbTemp', baseline: '70', modification: '80' },
      { label: 'Relative Humidity', key: 'relativeHumidity', baseline: '50', modification: '40' },
      { label: 'Wet Bulb', key: 'wetBulbTemp', baseline: '60', modification: '65' },
      { label: 'Dew Point', key: 'dewPoint', baseline: '55', modification: '58' },
      { label: 'Enthalpy', key: 'enthalpy', baseline: '30', modification: '32' },
      { label: 'Air Density', key: 'gasDensity', baseline: '0.07500', modification: '0.08000' },
      { label: 'Specific Volume', key: 'specificVolume', baseline: '13', modification: '14' },
      { label: 'Barometric Pressure', key: 'barometricPressure', baseline: '14.7', modification: '14.6' },
      { label: 'Saturation Pressure', key: 'saturationPressure', baseline: '0.36', modification: '0.4' },
      { label: 'Saturation Humidity Ratio', key: 'saturatedHumidity', baseline: '0.01', modification: '0.02' },
      { label: 'Absolute Pressure', key: 'absolutePressure', baseline: '14.5', modification: '14.4' },
      { label: 'Degree of Saturation', key: 'saturationDegree', baseline: '0.5', modification: '0.6' },
      { label: 'Humidity Ratio', key: 'humidityRatio', baseline: '0.0123', modification: '0.0145' },
    ];
    const modificationOverrides: Partial<PsychrometricResults> = {
      dryBulbTemp: 80, relativeHumidity: 40, wetBulbTemp: 65, dewPoint: 58, enthalpy: 32, gasDensity: 0.08,
      specificVolume: 14, barometricPressure: 14.6, saturationPressure: 0.4, saturatedHumidity: 0.02,
      absolutePressure: 14.4, saturationDegree: 0.6, humidityRatio: 0.0145,
    };

    rows.forEach(({ label, key, baseline, modification }) => {
      it(`shows the baseline and modification values for "${label}" when they are set`, () => {
        render(makeAssessment(makePsychrometricResults(), [
          makeModification('Mod A', makePsychrometricResults(modificationOverrides)),
        ]));

        expect(getRowCells(label).slice(1)).toEqual([baseline, modification]);
      });

      it(`shows an em dash for the baseline "${label}" when it is empty`, () => {
        render(makeAssessment(makePsychrometricResults({ [key]: 0 }), [
          makeModification('Mod A', makePsychrometricResults(modificationOverrides)),
        ]));

        expect(getRowCells(label).slice(1)).toEqual([EM_DASH, modification]);
      });

      it(`shows an em dash for the modification "${label}" when it is empty`, () => {
        render(makeAssessment(makePsychrometricResults(), [
          makeModification('Mod A', makePsychrometricResults({ [key]: 0 })),
        ]));

        expect(getRowCells(label).slice(1)).toEqual([baseline, EM_DASH]);
      });
    });
  });

  describe('template visibility: unit labels', () => {
    it('labels enthalpy and specific volume in metric units for Metric settings', () => {
      render(
        makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]),
        { settings: makeSettings({ unitsOfMeasure: 'Metric' }) }
      );

      expect(getRowCells('Enthalpy')[0]).toBe('Enthalpy (kJ/kg)');
      expect(getRowCells('Specific Volume')[0]).toBe('Specific Volume (m3/kg)');
    });

    it('labels enthalpy and specific volume in imperial units for other settings', () => {
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]));

      expect(getRowCells('Enthalpy')[0]).toBe('Enthalpy (btu/lb)');
      expect(getRowCells('Specific Volume')[0]).toBe('Specific Volume (ft3/lb)');
    });
  });

  describe('template visibility: baseline warnings', () => {
    it('hides the baseline warning when there is no warning', () => {
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]));

      expect(getWarningBoxes().length).toBe(0);
    });

    it('shows both baseline messages when humidity ratio and saturation pressure warn', () => {
      const baseline = makePsychrometricResults();
      warningsByResults.set(baseline, {
        hasResultWarning: true, resultHumidityRatio: 'negative humidity ratio', resultSaturationPressure: 'negative saturation pressure',
      });
      render(makeAssessment(baseline, [makeModification('Mod A', makePsychrometricResults())]));

      const boxes = getWarningBoxes();
      expect(boxes.length).toBe(1);
      const messages = Array.from(boxes[0].querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
      expect(messages).toEqual(['Baseline negative humidity ratio', 'Baseline negative saturation pressure']);
    });

    it('shows only the humidity ratio message when saturation pressure does not warn', () => {
      const baseline = makePsychrometricResults();
      warningsByResults.set(baseline, { hasResultWarning: true, resultHumidityRatio: 'negative humidity ratio' });
      render(makeAssessment(baseline, [makeModification('Mod A', makePsychrometricResults())]));

      const messages = Array.from(getWarningBoxes()[0].querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
      expect(messages).toEqual(['Baseline negative humidity ratio']);
    });

    it('shows only the saturation pressure message when humidity ratio does not warn', () => {
      const baseline = makePsychrometricResults();
      warningsByResults.set(baseline, { hasResultWarning: true, resultSaturationPressure: 'negative saturation pressure' });
      render(makeAssessment(baseline, [makeModification('Mod A', makePsychrometricResults())]));

      const messages = Array.from(getWarningBoxes()[0].querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
      expect(messages).toEqual(['Baseline negative saturation pressure']);
    });
  });

  describe('template visibility: modification warnings', () => {
    it('shows both messages prefixed with the modification name', () => {
      const modResults = makePsychrometricResults();
      warningsByResults.set(modResults, {
        hasResultWarning: true, resultHumidityRatio: 'negative humidity ratio', resultSaturationPressure: 'negative saturation pressure',
      });
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', modResults)]));

      const boxes = getWarningBoxes();
      expect(boxes.length).toBe(1);
      const messages = Array.from(boxes[0].querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
      expect(messages).toEqual(['Mod A negative humidity ratio', 'Mod A negative saturation pressure']);
    });

    it('shows only the humidity ratio message when saturation pressure does not warn', () => {
      const modResults = makePsychrometricResults();
      warningsByResults.set(modResults, { hasResultWarning: true, resultHumidityRatio: 'negative humidity ratio' });
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', modResults)]));

      const messages = Array.from(getWarningBoxes()[0].querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
      expect(messages).toEqual(['Mod A negative humidity ratio']);
    });

    it('shows only the saturation pressure message when humidity ratio does not warn', () => {
      const modResults = makePsychrometricResults();
      warningsByResults.set(modResults, { hasResultWarning: true, resultSaturationPressure: 'negative saturation pressure' });
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', modResults)]));

      const messages = Array.from(getWarningBoxes()[0].querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
      expect(messages).toEqual(['Mod A negative saturation pressure']);
    });

    it('reports the first modification that has a warning', () => {
      const secondMod = makePsychrometricResults();
      const thirdMod = makePsychrometricResults();
      warningsByResults.set(secondMod, { hasResultWarning: true, resultHumidityRatio: 'second warning' });
      warningsByResults.set(thirdMod, { hasResultWarning: true, resultHumidityRatio: 'third warning' });
      render(makeAssessment(makePsychrometricResults(), [
        makeModification('Mod A', makePsychrometricResults()),
        makeModification('Mod B', secondMod),
        makeModification('Mod C', thirdMod),
      ]));

      const boxes = getWarningBoxes();
      expect(boxes.length).toBe(1);
      expect(normalize(boxes[0].textContent)).toBe('Mod B second warning');
    });

    it('shows both the baseline and modification warning boxes when both warn', () => {
      const baseline = makePsychrometricResults();
      const modResults = makePsychrometricResults();
      warningsByResults.set(baseline, { hasResultWarning: true, resultHumidityRatio: 'baseline warning' });
      warningsByResults.set(modResults, { hasResultWarning: true, resultHumidityRatio: 'mod warning' });
      render(makeAssessment(baseline, [makeModification('Mod A', modResults)]));

      expect(getWarningBoxes().map(box => normalize(box.textContent))).toEqual([
        'Baseline baseline warning',
        'Mod A mod warning',
      ]);
    });
  });

  describe('template visibility: traverse data results', () => {
    const PLANE_RESULTS: PlaneResults = { error: false };

    it('hides the traverse section when neither baseline nor modifications have plane results', () => {
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]));

      expect(component.showPlaneResults).toBeFalse();
      expect(fixture.nativeElement.querySelectorAll('app-traverse-results').length).toBe(0);
      expect(Array.from(fixture.nativeElement.querySelectorAll('h6')).map((h: HTMLElement) => normalize(h.textContent)))
        .toEqual(['Psychrometric Data']);
    });

    it('shows a traverse table for the baseline and each modification when the baseline has plane results', () => {
      render(makeAssessment(
        makePsychrometricResults(),
        [makeModification('Mod A', makePsychrometricResults()), makeModification('Mod B', makePsychrometricResults())],
        PLANE_RESULTS
      ));

      expect(Array.from(fixture.nativeElement.querySelectorAll('h6')).map((h: HTMLElement) => normalize(h.textContent)))
        .toEqual(['Psychrometric Data', 'Traverse Data Results']);
      expect(fixture.nativeElement.querySelectorAll('app-traverse-results').length).toBe(3);
    });

    it('shows the traverse section when only a modification has plane results', () => {
      render(makeAssessment(
        makePsychrometricResults(),
        [makeModification('Mod A', makePsychrometricResults(), PLANE_RESULTS)]
      ));

      expect(fixture.nativeElement.querySelectorAll('app-traverse-results').length).toBe(2);
    });
  });

  describe('user actions', () => {
    it('copies the psychrometric table text for export', () => {
      render(makeAssessment(makePsychrometricResults(), [makeModification('Mod A', makePsychrometricResults())]));

      component.updateCopyTableString();

      expect(component.copyTableString).toContain('Relative Humidity');
      expect(component.copyTableString).toContain('Mod A');
    });
  });
});
