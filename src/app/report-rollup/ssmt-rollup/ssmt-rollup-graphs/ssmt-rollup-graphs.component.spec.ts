import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupGraphsComponent } from './ssmt-rollup-graphs.component';

describe('SsmtRollupGraphsComponent', () => {
  let component: SsmtRollupGraphsComponent;
  let fixture: ComponentFixture<SsmtRollupGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
