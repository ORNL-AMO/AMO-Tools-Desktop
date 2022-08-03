import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirflowSankeyComponent } from './airflow-sankey.component';

describe('AirflowSankeyComponent', () => {
  let component: AirflowSankeyComponent;
  let fixture: ComponentFixture<AirflowSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirflowSankeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirflowSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
