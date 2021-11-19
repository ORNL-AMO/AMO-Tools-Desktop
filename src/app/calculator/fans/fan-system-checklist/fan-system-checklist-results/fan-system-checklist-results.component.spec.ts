import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemChecklistResultsComponent } from './fan-system-checklist-results.component';

describe('FanSystemChecklistResultsComponent', () => {
  let component: FanSystemChecklistResultsComponent;
  let fixture: ComponentFixture<FanSystemChecklistResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanSystemChecklistResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemChecklistResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
