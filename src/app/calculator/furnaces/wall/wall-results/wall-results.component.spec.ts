import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallResultsComponent } from './wall-results.component';

describe('WallResultsComponent', () => {
  let component: WallResultsComponent;
  let fixture: ComponentFixture<WallResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WallResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WallResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
