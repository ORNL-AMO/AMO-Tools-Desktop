import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupComponent } from './ssmt-rollup.component';

describe('SsmtRollupComponent', () => {
  let component: SsmtRollupComponent;
  let fixture: ComponentFixture<SsmtRollupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
