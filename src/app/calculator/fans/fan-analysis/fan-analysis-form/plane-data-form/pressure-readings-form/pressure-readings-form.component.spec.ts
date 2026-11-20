import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PressureReadingsFormComponent } from './pressure-readings-form.component';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Fan203Inputs, Plane } from '../../../../../../shared/models/fans';

function makeInputData(): Fan203Inputs {
  const data = FanAnalysisService.prototype.getDefaultData();
  Object.assign(data.PlaneData.FlowTraverse, {
    numTraverseHoles: 3,
    numInsertionPoints: 2,
    traverseData: [[1, 2, 3], [4, 5, 6]],
    staticPressureData: [[1, 2, 3], [4, 5, 6]],
  });
  return data;
}

function makeFanAnalysisServiceMock(inputData: Fan203Inputs) {
  const mock = jasmine.createSpyObj('FanAnalysisService', ['getPlane', 'setPlane']);
  mock.inputData = inputData;
  mock.getResults = new BehaviorSubject<boolean>(true);
  mock.resetForms = new BehaviorSubject<boolean>(false);
  mock.updateTraverseData = new BehaviorSubject<boolean>(false);
  mock.getPlane.and.callFake((planeNum: string) => FanAnalysisService.prototype.getPlane.call(mock, planeNum));
  mock.setPlane.and.callFake((planeNum: string, plane: Plane) => FanAnalysisService.prototype.setPlane.call(mock, planeNum, plane));
  return mock;
}

function text(el: Element): string {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
}

describe('PressureReadingsFormComponent', () => {
  let component: PressureReadingsFormComponent;
  let fixture: ComponentFixture<PressureReadingsFormComponent>;
  let fanAnalysisServiceMock: any;
  let inputData: Fan203Inputs;

  beforeEach(async () => {
    inputData = makeInputData();
    fanAnalysisServiceMock = makeFanAnalysisServiceMock(inputData);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PressureReadingsFormComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisServiceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  async function setup(pressureType?: string) {
    fixture = TestBed.createComponent(PressureReadingsFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('planeNum', '3a');
    if (pressureType) {
      fixture.componentRef.setInput('pressureType', pressureType);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function labelInputs(): Array<HTMLInputElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('input[id^="label_"]'));
  }

  function holeInputs(): Array<HTMLInputElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('input[id^="hole"]'));
  }

  function hole(row: number, col: number): HTMLInputElement {
    return fixture.nativeElement.querySelector(`#hole${row}_${col}`);
  }

  function rowLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.input-group-prepend .input-group-text:not(.hide-text)') as NodeListOf<Element>)
      .map(el => text(el));
  }

  function setPlaneSize(numTraverseHoles: number, numInsertionPoints: number) {
    inputData.PlaneData.FlowTraverse.numTraverseHoles = numTraverseHoles;
    inputData.PlaneData.FlowTraverse.numInsertionPoints = numInsertionPoints;
  }

  describe('initialization', () => {
    it('creates the component', async () => {
      await setup();
      expect(component).toBeTruthy();
    });

    it('loads velocity traverse data by default and saves it to the plane', async () => {
      await setup();
      expect(component.traverseHoles).toEqual([[1, 2, 3], [4, 5, 6]]);
      expect(inputData.PlaneData.FlowTraverse.traverseData).toBe(component.traverseHoles);
      expect(fanAnalysisServiceMock.setPlane).toHaveBeenCalledWith('3a', component.planeData);
    });

    it('loads static pressure data and averages it for the Static pressure type', async () => {
      inputData.PlaneData.FlowTraverse.staticPressureData = [[1, 2, 3], [4, 5, 7]];
      await setup('Static');
      expect(component.traverseHoles).toEqual([[1, 2, 3], [4, 5, 7]]);
      expect(inputData.PlaneData.FlowTraverse.staticPressure).toBeCloseTo(22 / 6, 10);
    });

    it('pads missing rows and columns with zeros to match the plane size', async () => {
      inputData.PlaneData.FlowTraverse.traverseData = [[1]];
      await setup();
      expect(component.traverseHoles).toEqual([[1, 0, 0], [0, 0, 0]]);
    });

    it('renders the pressure type in the heading', async () => {
      await setup('Static');
      expect(fixture.nativeElement.textContent).toContain('Pitot Tube Static Pressure Readings');
    });
  });

  describe('template: traverse grid', () => {
    it('renders one disabled label input per traverse hole', async () => {
      await setup();
      const labels = labelInputs();
      expect(labels.map(el => el.id)).toEqual(['label_0', 'label_1', 'label_2']);
      expect(labels.map(el => el.value)).toEqual(['1', '2', '3']);
      expect(labels.every(el => el.disabled)).toBeTrue();
    });

    it('renders one row per insertion point with a 1-based row label', async () => {
      await setup();
      expect(rowLabels()).toEqual(['1', '2']);
    });

    it('renders one input per traverse hole cell with matching ids and values', async () => {
      await setup();
      const holes = holeInputs();
      expect(holes.map(el => el.id)).toEqual(['hole0_0', 'hole0_1', 'hole0_2', 'hole1_0', 'hole1_1', 'hole1_2']);
      expect(holes.map(el => el.value)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('marks velocity cells as required', async () => {
      await setup();
      expect(holeInputs().every(el => el.hasAttribute('required'))).toBeTrue();
    });

    it('does not mark static pressure cells as required', async () => {
      await setup('Static');
      expect(holeInputs().some(el => el.hasAttribute('required'))).toBeFalse();
    });

    it('renders no rows or holes for an empty plane', async () => {
      setPlaneSize(0, 0);
      await setup();
      expect(labelInputs().length).toBe(0);
      expect(holeInputs().length).toBe(0);
      expect(rowLabels()).toEqual([]);
    });
  });

  describe('updateTraverseData observer', () => {
    it('resizes the grid to the new plane size', async () => {
      await setup();
      setPlaneSize(4, 3);
      fanAnalysisServiceMock.updateTraverseData.next(true);
      await render();
      expect(labelInputs().map(el => el.value)).toEqual(['1', '2', '3', '4']);
      expect(rowLabels()).toEqual(['1', '2', '3']);
      expect(holeInputs().map(el => el.value)).toEqual(['1', '2', '3', '0', '4', '5', '6', '0', '0', '0', '0', '0']);
    });

    it('shrinks the grid to the new plane size', async () => {
      await setup();
      setPlaneSize(2, 1);
      fanAnalysisServiceMock.updateTraverseData.next(true);
      await render();
      expect(labelInputs().map(el => el.id)).toEqual(['label_0', 'label_1']);
      expect(holeInputs().map(el => el.id)).toEqual(['hole0_0', 'hole0_1']);
      expect(holeInputs().map(el => el.value)).toEqual(['1', '2']);
    });

    it('ignores false updates', async () => {
      await setup();
      const before = component.traverseHoles;
      setPlaneSize(4, 3);
      fanAnalysisServiceMock.updateTraverseData.next(false);
      expect(component.traverseHoles).toBe(before);
    });
  });

  describe('resetForms observer', () => {
    it('reloads the grid from the plane data on reset', async () => {
      await setup();
      inputData.PlaneData.FlowTraverse = {
        ...inputData.PlaneData.FlowTraverse,
        numTraverseHoles: 2,
        numInsertionPoints: 1,
        traverseData: [[8, 9]],
      };
      fanAnalysisServiceMock.resetForms.next(true);
      await render();
      expect(labelInputs().map(el => el.value)).toEqual(['1', '2']);
      expect(holeInputs().map(el => el.value)).toEqual(['8', '9']);
    });
  });

  describe('DOM tracking', () => {
    it('keeps label input nodes when the number of holes grows (index tracking)', async () => {
      await setup();
      const firstLabel = labelInputs()[0];
      setPlaneSize(4, 2);
      fanAnalysisServiceMock.updateTraverseData.next(true);
      await render();
      expect(labelInputs()[0]).toBe(firstLabel);
    });

    it('keeps a hole input node when its value changes (index tracking)', async () => {
      await setup();
      const cell = hole(0, 0);
      component.traverseHoles[0][0] = 9;
      await render();
      expect(hole(0, 0)).toBe(cell);
      expect(hole(0, 0).value).toBe('9');
    });

    it('keeps row nodes when a cell is edited (row identity unchanged)', async () => {
      await setup();
      const cell = hole(1, 2);
      cell.value = '7';
      cell.dispatchEvent(new Event('input'));
      await render();
      expect(hole(1, 2)).toBe(cell);
    });

    it('re-creates row inputs after a traverse update replaces the row arrays (row identity tracking)', async () => {
      await setup();
      const cell = hole(0, 0);
      fanAnalysisServiceMock.updateTraverseData.next(true);
      await render();
      expect(hole(0, 0)).not.toBe(cell);
      expect(hole(0, 0).value).toBe('1');
    });
  });

  describe('user input', () => {
    it('writes a typed cell value into the traverse data and requests results', async () => {
      await setup();
      spyOn(fanAnalysisServiceMock.getResults, 'next').and.callThrough();
      fanAnalysisServiceMock.setPlane.calls.reset();
      const cell = hole(1, 0);
      cell.value = '7';
      cell.dispatchEvent(new Event('input'));
      expect(String(component.traverseHoles[1][0])).toBe('7');
      expect(String(inputData.PlaneData.FlowTraverse.traverseData[1][0])).toBe('7');
      expect(fanAnalysisServiceMock.setPlane).toHaveBeenCalledWith('3a', component.planeData);
      expect(fanAnalysisServiceMock.getResults.next).toHaveBeenCalledWith(true);
    });

    const focusCases = [
      { method: 'shiftFocusDown', args: [0, 1, 3], target: [1, 1] },
      { method: 'shiftFocusDown', args: [1, 1, 3], target: [1, 1] },
      { method: 'shiftFocusUp', args: [1, 2, 3], target: [0, 2] },
      { method: 'shiftFocusUp', args: [0, 2, 3], target: [0, 2] },
      { method: 'shiftFocusLeft', args: [1, 1, 3], target: [1, 0] },
      { method: 'shiftFocusLeft', args: [1, 0, 3], target: [1, 0] },
      { method: 'shiftFocusRight', args: [0, 1, 3], target: [0, 2] },
      { method: 'shiftFocusRight', args: [0, 2, 3], target: [0, 2] },
    ];
    focusCases.forEach(({ method, args, target }) => {
      it(`${method}(${args.join(', ')}) focuses hole${target[0]}_${target[1]}`, async () => {
        await setup();
        const targetInput = hole(target[0], target[1]);
        spyOn(targetInput, 'focus');
        component[method](...args);
        expect(targetInput.focus).toHaveBeenCalled();
      });
    });
  });

  describe('setImportFile', () => {
    it('ignores non-xlsx files', async () => {
      await setup();
      spyOn(component, 'importFiles');
      component.setImportFile([{ name: 'data.csv' }] as any);
      expect(component.fileReferences).toEqual([]);
      expect(component.importFiles).not.toHaveBeenCalled();
    });

    it('imports xlsx files', async () => {
      await setup();
      spyOn(component, 'importFiles');
      const file = { name: 'data.xlsx' };
      component.setImportFile([file] as any);
      expect(component.fileReferences).toEqual([file]);
      expect(component.importFiles).toHaveBeenCalled();
    });
  });

  describe('template visibility: messages', () => {
    it('hides the import error by default', async () => {
      await setup();
      expect(fixture.nativeElement.textContent).not.toContain('Error importing file');
    });

    it('shows the import error when the imported data is invalid', async () => {
      await setup();
      component.hasErrorData = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Error importing file. Please make sure that all rows and columns have the same length');
    });

    it('hides the traverse hole warning when every static reading is present', async () => {
      await setup('Static');
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the traverse hole warning when a static reading is missing', async () => {
      inputData.PlaneData.FlowTraverse.staticPressureData = [[1, undefined, 3], [4, 5, 6]];
      await setup('Static');
      expect(text(fixture.nativeElement.querySelector('.alert-warning'))).toBe('Enter a value for each insertion point');
    });

    it('never shows the traverse hole warning for velocity readings', async () => {
      inputData.PlaneData.FlowTraverse.traverseData = [[1, undefined, 3], [4, 5, 6]];
      await setup();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });
  });

  describe('trackByFn', () => {
    it('tracks by index', async () => {
      await setup();
      expect(component.trackByFn(2, 'anything')).toBe(2);
    });
  });

  describe('destroy', () => {
    it('stops reacting to traverse updates and resets after destroy', async () => {
      await setup();
      const before = component.traverseHoles;
      fixture.destroy();
      setPlaneSize(4, 3);
      fanAnalysisServiceMock.updateTraverseData.next(true);
      fanAnalysisServiceMock.resetForms.next(true);
      expect(component.traverseHoles).toBe(before);
    });
  });
});
