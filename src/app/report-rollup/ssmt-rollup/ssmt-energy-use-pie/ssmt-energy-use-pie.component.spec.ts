import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtEnergyUsePieComponent } from './ssmt-energy-use-pie.component';

describe('SsmtEnergyUsePieComponent', () => {
  let component: SsmtEnergyUsePieComponent;
  let fixture: ComponentFixture<SsmtEnergyUsePieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtEnergyUsePieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtEnergyUsePieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
