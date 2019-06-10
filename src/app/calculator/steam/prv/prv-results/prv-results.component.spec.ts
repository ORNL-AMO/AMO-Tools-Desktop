import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvResultsComponent } from './prv-results.component';

describe('PrvResultsComponent', () => {
  let component: PrvResultsComponent;
  let fixture: ComponentFixture<PrvResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrvResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
