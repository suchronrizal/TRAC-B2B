import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimebaseComponent } from './timebase.component';

describe('TimebaseComponent', () => {
  let component: TimebaseComponent;
  let fixture: ComponentFixture<TimebaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimebaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
