import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterCompressorsComponent } from './filter-compressors.component';

describe('FilterCompressorsComponent', () => {
  let component: FilterCompressorsComponent;
  let fixture: ComponentFixture<FilterCompressorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterCompressorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterCompressorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
