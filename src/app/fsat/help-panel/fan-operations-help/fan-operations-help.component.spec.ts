import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanOperationsHelpComponent } from './fan-operations-help.component';

describe('FanOperationsHelpComponent', () => {
  let component: FanOperationsHelpComponent;
  let fixture: ComponentFixture<FanOperationsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanOperationsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanOperationsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
