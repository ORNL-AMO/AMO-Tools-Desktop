import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatRollupGraphsComponent } from './psat-rollup-graphs.component';

describe('PsatRollupGraphsComponent', () => {
  let component: PsatRollupGraphsComponent;
  let fixture: ComponentFixture<PsatRollupGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatRollupGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatRollupGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
