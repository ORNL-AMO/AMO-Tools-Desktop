import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateDataTableComponent } from './nameplate-data-table.component';

describe('NameplateDataTableComponent', () => {
  let component: NameplateDataTableComponent;
  let fixture: ComponentFixture<NameplateDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameplateDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameplateDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
