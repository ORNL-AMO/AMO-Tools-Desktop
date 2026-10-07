import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PumpOperationsHelpComponent } from './pump-operations-help.component';
import { HelpPanelService } from '../help-panel.service';

describe('PumpOperationsHelpComponent', () => {
  let component: PumpOperationsHelpComponent;
  let fixture: ComponentFixture<PumpOperationsHelpComponent>;
  let helpPanelService: HelpPanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PumpOperationsHelpComponent],
      providers: [HelpPanelService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    helpPanelService = TestBed.inject(HelpPanelService);
    fixture = TestBed.createComponent(PumpOperationsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('starts with currentField unset', () => {
      expect(component.currentField).toBeNull();
    });
  });

  describe('observeCurrentFieldChange', () => {
    it('sets currentField from the help panel service when it emits', () => {
      helpPanelService.currentField.next('operatingHours');
      expect(component.currentField).toBe('operatingHours');
    });

    it('updates currentField again on a subsequent emission', () => {
      helpPanelService.currentField.next('operatingHours');
      helpPanelService.currentField.next('costKwHr');
      expect(component.currentField).toBe('costKwHr');
    });
  });

  describe('template visibility', () => {
    it('renders no help block when currentField does not match any known field', () => {
      expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(0);
    });

    it('shows the operations heading and Operating Hours detail when currentField is operatingHours', () => {
      helpPanelService.currentField.next('operatingHours');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(2);
      expect(fixture.nativeElement.textContent).toContain('Operations Help');
      expect(fixture.nativeElement.textContent).toContain('Operating Hours');
      expect(fixture.nativeElement.textContent).not.toContain('Per unit cost of electricity');
    });

    it('shows the operations heading and Cost detail when currentField is costKwHr', () => {
      helpPanelService.currentField.next('costKwHr');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(2);
      expect(fixture.nativeElement.textContent).toContain('Operations Help');
      expect(fixture.nativeElement.textContent).toContain('Cost');
      expect(fixture.nativeElement.textContent).not.toContain('Annual operating hours of the pump.');
    });

    it('hides the operations heading when currentField matches neither operatingHours nor costKwHr', () => {
      helpPanelService.currentField.next('somethingElse');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('Operations Help');
    });
  });

  describe('destroy', () => {
    it('stops updating currentField after the component is destroyed', () => {
      fixture.destroy();
      helpPanelService.currentField.next('operatingHours');
      expect(component.currentField).toBeNull();
    });
  });
});
