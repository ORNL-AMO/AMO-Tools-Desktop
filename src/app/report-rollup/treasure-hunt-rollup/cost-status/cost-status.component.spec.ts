import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostStatusComponent } from './cost-status.component';

describe('CostStatusComponent', () => {
  let component: CostStatusComponent;
  let fixture: ComponentFixture<CostStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
