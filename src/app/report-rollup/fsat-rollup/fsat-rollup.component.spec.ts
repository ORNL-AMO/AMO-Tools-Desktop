import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatRollupComponent } from './fsat-rollup.component';

describe('FsatRollupComponent', () => {
  let component: FsatRollupComponent;
  let fixture: ComponentFixture<FsatRollupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatRollupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
