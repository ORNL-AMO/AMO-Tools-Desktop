import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterHeatingResultsComponent } from './water-heating-results.component';

describe('WaterHeatingResultsComponent', () => {
  let component: WaterHeatingResultsComponent;
  let fixture: ComponentFixture<WaterHeatingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterHeatingResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterHeatingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
