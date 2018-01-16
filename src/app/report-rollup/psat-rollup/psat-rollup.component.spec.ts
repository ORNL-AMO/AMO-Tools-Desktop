import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatRollupComponent } from './psat-rollup.component';

describe('PsatRollupComponent', () => {
  let component: PsatRollupComponent;
  let fixture: ComponentFixture<PsatRollupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatRollupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
