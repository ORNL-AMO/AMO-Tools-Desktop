import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirLeakCopyTableComponent } from './air-leak-copy-table.component';

describe('AirLeakCopyTableComponent', () => {
  let component: AirLeakCopyTableComponent;
  let fixture: ComponentFixture<AirLeakCopyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirLeakCopyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirLeakCopyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
