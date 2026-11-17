import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ValveEnergyLossHelpComponent } from './valve-energy-loss-help.component';
import { ValveEnergyLossService } from '../valve-energy-loss.service';

// currentField value -> heading text that identifies its help block.
const HELP_HEADINGS: Array<[field: string, heading: string]> = [
  ['hoursOperation', 'Annual Operating Hours'],
  ['electricalRate', 'Electrical Cost'],
  ['efficiencyPump', 'Pump Efficiency'],
  ['efficiencyMotor', 'Motor Efficiency'],
  ['SG', 'Specific Gravity'],
  ['flowRate', 'Flow Rate'],
  ['upstreamPressure', 'Upstream Pressure'],
  ['upstreamDiameter', 'Upstream Diameter'],
  ['upstreamHeight', 'Upstream Gage Elevation'],
  ['valveDiameter', 'Valve Diameter'],
  ['downstreamPressure', 'Downstream Pressure'],
  ['downstreamDiameter', 'Downstream Pipe Inner Diameter'],
  ['downstreamHeight', 'Downstream Gauge Elevation'],
  ['pipeSizeFactor', 'Pipe Sizing Geometry Factor'],
];

describe('ValveEnergyLossHelpComponent', () => {
  let component: ValveEnergyLossHelpComponent;
  let fixture: ComponentFixture<ValveEnergyLossHelpComponent>;
  let currentField: BehaviorSubject<string>;

  function getFieldHelpBlocks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function headingText(block: HTMLElement): string {
    return block.querySelector('h6').childNodes[0].textContent.trim();
  }

  function showField(field: string): void {
    currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    currentField = new BehaviorSubject<string>('default');
    const serviceMock = { currentField } as Partial<ValveEnergyLossService>;

    await TestBed.configureTestingModule({
      declarations: [ValveEnergyLossHelpComponent],
      providers: [{ provide: ValveEnergyLossService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ValveEnergyLossHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('subscribes to the service current field', () => {
      expect(component.currentField).toBe('default');
    });

    it('always renders the general help text', () => {
      expect(fixture.nativeElement.querySelector('h5').textContent.trim()).toBe('Valve Energy Loss Help');
    });
  });

  describe('template visibility', () => {
    it('renders no field help block for the default field', () => {
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    it('renders no field help block for an unknown field', () => {
      showField('notAField');
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    HELP_HEADINGS.forEach(([field, heading]) => {
      it(`renders only the "${heading}" help block when currentField is ${field}`, () => {
        showField(field);
        const blocks = getFieldHelpBlocks();
        expect(blocks.length).toBe(1);
        expect(headingText(blocks[0])).toBe(heading);
      });
    });

    it('renders the operating hours range table only for hoursOperation', () => {
      showField('hoursOperation');
      const cells = Array.from(getFieldHelpBlocks()[0].querySelectorAll('td'))
        .map((cell: HTMLElement) => cell.textContent.trim());
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);

      showField('electricalRate');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('swaps the help block when the field changes', () => {
      showField('flowRate');
      showField('SG');
      const blocks = getFieldHelpBlocks();
      expect(blocks.length).toBe(1);
      expect(headingText(blocks[0])).toBe('Specific Gravity');
    });
  });

  describe('destroy', () => {
    it('stops updating the current field after destroy', () => {
      fixture.destroy();
      currentField.next('flowRate');
      expect(component.currentField).toBe('default');
    });
  });
});
