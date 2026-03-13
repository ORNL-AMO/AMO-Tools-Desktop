import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirAirflowSavingsGraphComponent } from './compressed-air-airflow-savings-graph.component';

describe('CompressedAirAirflowSavingsGraphComponent', () => {
  let component: CompressedAirAirflowSavingsGraphComponent;
  let fixture: ComponentFixture<CompressedAirAirflowSavingsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirAirflowSavingsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirAirflowSavingsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
