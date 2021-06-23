import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemChecklistHelpComponent } from './fan-system-checklist-help.component';

describe('FanSystemChecklistHelpComponent', () => {
  let component: FanSystemChecklistHelpComponent;
  let fixture: ComponentFixture<FanSystemChecklistHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanSystemChecklistHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemChecklistHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
