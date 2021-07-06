import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesHiddenCopyTableComponent } from './saturated-properties-hidden-copy-table.component';

describe('SaturatedPropertiesHiddenCopyTableComponent', () => {
  let component: SaturatedPropertiesHiddenCopyTableComponent;
  let fixture: ComponentFixture<SaturatedPropertiesHiddenCopyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesHiddenCopyTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesHiddenCopyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
