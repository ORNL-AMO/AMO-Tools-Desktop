import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilitiesListComponent } from './utilities-list.component';

describe('UtilitiesListComponent', () => {
  let component: UtilitiesListComponent;
  let fixture: ComponentFixture<UtilitiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilitiesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
