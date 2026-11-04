import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FsatBasicsHelpComponent } from './fsat-basics-help.component';

describe('FsatBasicsHelpComponent', () => {
  let component: FsatBasicsHelpComponent;
  let fixture: ComponentFixture<FsatBasicsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FsatBasicsHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatBasicsHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('template visibility', () => {
    it('renders the help header without a field card when currentField is undefined', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.help-header h3').textContent).toContain('Basic Info Help');
      expect(fixture.nativeElement.querySelector('.card')).toBeNull();
    });

    it('hides the fan speed card when currentField is not fanSpeed', () => {
      component.currentField = 'other';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.card')).toBeNull();
    });

    it('shows the fan speed card when currentField is fanSpeed', () => {
      component.currentField = 'fanSpeed';
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.card');
      expect(cards.length).toBe(1);
      expect(cards[0].querySelector('.card-header').textContent).toContain('Fan Speed Help');
    });
  });
});
