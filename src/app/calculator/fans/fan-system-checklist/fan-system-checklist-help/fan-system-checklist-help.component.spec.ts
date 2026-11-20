import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanSystemChecklistHelpComponent } from './fan-system-checklist-help.component';
import { FanSystemChecklistService } from '../fan-system-checklist.service';

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanSystemChecklistHelpComponent', () => {
  let component: FanSystemChecklistHelpComponent;
  let fixture: ComponentFixture<FanSystemChecklistHelpComponent>;
  let serviceMock: Partial<FanSystemChecklistService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function setCurrentField(value: string): void {
    serviceMock.currentField.next(value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceMock = { currentField: new BehaviorSubject<string>(undefined) };

    await TestBed.configureTestingModule({
      declarations: [FanSystemChecklistHelpComponent],
      providers: [{ provide: FanSystemChecklistService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanSystemChecklistHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns the current field from the service', () => {
      expect(component.currentField).toBeUndefined();
    });
  });

  describe('observe currentField', () => {
    it('updates currentField when the service emits', () => {
      setCurrentField('motorPower');
      expect(component.currentField).toBe('motorPower');
    });
  });

  describe('template visibility', () => {
    it('hides the operating hours section and trailing divider when currentField is undefined', () => {
      expect(query('.help-info > .my-2')).toBeNull();
      expect(query('.help-info > hr')).toBeNull();
    });

    it('hides the operating hours section and trailing divider when currentField is null', () => {
      setCurrentField(null);
      expect(query('.help-info > .my-2')).toBeNull();
      expect(query('.help-info > hr')).toBeNull();
    });

    it('shows the operating hours section and trailing divider when currentField is operatingHours', () => {
      setCurrentField('operatingHours');
      expect(normalize(query('.help-info > .my-2 h6').childNodes[0].textContent)).toBe('Operating Hours');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 td'))
        .map((cell: HTMLElement) => normalize(cell.textContent));
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);
      expect(query('.help-info > hr')).not.toBeNull();
    });

    it('shows only the trailing divider when currentField is another field', () => {
      setCurrentField('motorPower');
      expect(query('.help-info > .my-2')).toBeNull();
      expect(query('.help-info > hr')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops updating currentField after the component is destroyed', () => {
      fixture.destroy();
      serviceMock.currentField.next('operatingHours');
      expect(component.currentField).toBeUndefined();
    });
  });
});
