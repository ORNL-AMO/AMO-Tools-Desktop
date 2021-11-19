import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisMenuComponent } from './analysis-menu.component';

describe('AnalysisMenuComponent', () => {
  let component: AnalysisMenuComponent;
  let fixture: ComponentFixture<AnalysisMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
