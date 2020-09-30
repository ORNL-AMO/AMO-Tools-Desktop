import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerFormComponent } from './cooling-tower-form.component';

describe('CoolingTowerFormComponent', () => {
  let component: CoolingTowerFormComponent;
  let fixture: ComponentFixture<CoolingTowerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingTowerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
