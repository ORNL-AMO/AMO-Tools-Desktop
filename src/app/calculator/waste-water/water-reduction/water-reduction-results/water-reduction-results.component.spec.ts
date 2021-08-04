import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReductionResultsComponent } from './water-reduction-results.component';

describe('WaterReductionResultsComponent', () => {
  let component: WaterReductionResultsComponent;
  let fixture: ComponentFixture<WaterReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
