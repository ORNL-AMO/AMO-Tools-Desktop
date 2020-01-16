import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirListComponent } from './compressed-air-list.component';

describe('CompressedAirListComponent', () => {
  let component: CompressedAirListComponent;
  let fixture: ComponentFixture<CompressedAirListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
