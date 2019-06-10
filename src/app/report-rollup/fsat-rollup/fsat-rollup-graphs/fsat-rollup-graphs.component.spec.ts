import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatRollupGraphsComponent } from './fsat-rollup-graphs.component';

describe('FsatRollupGraphsComponent', () => {
  let component: FsatRollupGraphsComponent;
  let fixture: ComponentFixture<FsatRollupGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatRollupGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatRollupGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
