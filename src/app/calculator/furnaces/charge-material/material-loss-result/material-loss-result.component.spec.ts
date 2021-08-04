import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialLossResultComponent } from './material-loss-result.component';

describe('MaterialLossResultComponent', () => {
  let component: MaterialLossResultComponent;
  let fixture: ComponentFixture<MaterialLossResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialLossResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialLossResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
