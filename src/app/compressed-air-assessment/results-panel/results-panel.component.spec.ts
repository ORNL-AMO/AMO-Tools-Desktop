import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsPanelComponent } from './results-panel.component';

describe('ResultsPanelComponent', () => {
  let component: ResultsPanelComponent;
  let fixture: ComponentFixture<ResultsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
