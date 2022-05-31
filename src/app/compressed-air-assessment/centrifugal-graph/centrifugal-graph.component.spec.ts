import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrifugalGraphComponent } from './centrifugal-graph.component';

describe('CentrifugalGraphComponent', () => {
  let component: CentrifugalGraphComponent;
  let fixture: ComponentFixture<CentrifugalGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentrifugalGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentrifugalGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
