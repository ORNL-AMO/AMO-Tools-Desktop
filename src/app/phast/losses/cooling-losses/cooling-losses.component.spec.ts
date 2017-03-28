import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingLossesComponent } from './cooling-losses.component';

describe('CoolingLossesComponent', () => {
  let component: CoolingLossesComponent;
  let fixture: ComponentFixture<CoolingLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
