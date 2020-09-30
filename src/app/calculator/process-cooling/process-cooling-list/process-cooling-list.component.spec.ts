import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCoolingListComponent } from './process-cooling-list.component';

describe('ProcessCoolingListComponent', () => {
  let component: ProcessCoolingListComponent;
  let fixture: ComponentFixture<ProcessCoolingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessCoolingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessCoolingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
