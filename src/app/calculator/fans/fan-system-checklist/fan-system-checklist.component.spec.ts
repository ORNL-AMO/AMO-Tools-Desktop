import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemChecklistComponent } from './fan-system-checklist.component';

describe('FanSystemChecklistComponent', () => {
  let component: FanSystemChecklistComponent;
  let fixture: ComponentFixture<FanSystemChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanSystemChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
