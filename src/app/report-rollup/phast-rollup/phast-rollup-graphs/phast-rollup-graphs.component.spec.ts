import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupGraphsComponent } from './phast-rollup-graphs.component';

describe('PhastRollupGraphsComponent', () => {
  let component: PhastRollupGraphsComponent;
  let fixture: ComponentFixture<PhastRollupGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
