import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupComponent } from './phast-rollup.component';

describe('PhastRollupComponent', () => {
  let component: PhastRollupComponent;
  let fixture: ComponentFixture<PhastRollupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
