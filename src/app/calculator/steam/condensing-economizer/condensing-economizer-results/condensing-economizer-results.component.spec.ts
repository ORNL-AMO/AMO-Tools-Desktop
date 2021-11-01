import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensingEconomizerResultsComponent } from './condensing-economizer-results.component';

describe('CondensingEconomizerResultsComponent', () => {
  let component: CondensingEconomizerResultsComponent;
  let fixture: ComponentFixture<CondensingEconomizerResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CondensingEconomizerResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensingEconomizerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
