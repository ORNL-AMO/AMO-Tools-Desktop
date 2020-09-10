import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartHoverDataComponent } from './chart-hover-data.component';

describe('ChartHoverDataComponent', () => {
  let component: ChartHoverDataComponent;
  let fixture: ComponentFixture<ChartHoverDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartHoverDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartHoverDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
