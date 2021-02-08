import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingResultsComponent } from './cooling-results.component';

describe('CoolingResultsComponent', () => {
  let component: CoolingResultsComponent;
  let fixture: ComponentFixture<CoolingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
