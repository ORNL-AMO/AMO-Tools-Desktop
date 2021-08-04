import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingComponent } from './cooling.component';

describe('CoolingComponent', () => {
  let component: CoolingComponent;
  let fixture: ComponentFixture<CoolingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
