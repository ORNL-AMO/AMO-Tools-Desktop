import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpsListComponent } from './pumps-list.component';

describe('PumpsListComponent', () => {
  let component: PumpsListComponent;
  let fixture: ComponentFixture<PumpsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
