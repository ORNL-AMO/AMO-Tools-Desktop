import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CleanDataComponent } from './clean-data.component';

describe('CleanDataComponent', () => {
  let component: CleanDataComponent;
  let fixture: ComponentFixture<CleanDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CleanDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CleanDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
