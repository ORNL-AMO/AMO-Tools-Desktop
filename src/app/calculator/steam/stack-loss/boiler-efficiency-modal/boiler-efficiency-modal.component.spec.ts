import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerEfficiencyModalComponent } from './boiler-efficiency-modal.component';

describe('BoilerEfficiencyModalComponent', () => {
  let component: BoilerEfficiencyModalComponent;
  let fixture: ComponentFixture<BoilerEfficiencyModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerEfficiencyModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerEfficiencyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
