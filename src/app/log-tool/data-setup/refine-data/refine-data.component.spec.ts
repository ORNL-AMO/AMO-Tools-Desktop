import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefineDataComponent } from './refine-data.component';

describe('RefineDataComponent', () => {
  let component: RefineDataComponent;
  let fixture: ComponentFixture<RefineDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefineDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefineDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
