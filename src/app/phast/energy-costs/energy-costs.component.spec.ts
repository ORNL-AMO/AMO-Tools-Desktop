import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyCostsComponent } from './energy-costs.component';

describe('EnergyCostsComponent', () => {
  let component: EnergyCostsComponent;
  let fixture: ComponentFixture<EnergyCostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyCostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
