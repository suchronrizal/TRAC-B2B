import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Component
import { MainOrderComponent } from './main-order/main-order.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { DetailOrderHistoryComponent } from './detail-order-history/detail-order-history.component';
import { equalGridDirective } from '../lib/directive/equal-grid.directive';
import { TimebaseComponent } from './timebase/timebase.component';
import { KmbaseComponent } from './kmbase/kmbase.component';
import { HourlyComponent } from './hourly/hourly.component';

// Service
import { OrderService } from './order.service';

// PrimeNG
import {
	DropdownModule,
	SpinnerModule,
	SelectButtonModule,
	CheckboxModule,
	CalendarModule,
	AccordionModule,
	AutoCompleteModule,
	MultiSelectModule,
	RadioButtonModule,
	GrowlModule,
	DataTableModule,
	InputSwitchModule,
	OverlayPanelModule,
	ProgressSpinnerModule,
	DialogModule,
	TabViewModule,
	TooltipModule,
	PaginatorModule,
	ProgressBarModule
} from 'primeng/primeng';
import { KeyFilterModule } from 'primeng/keyfilter';

// Google Map
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';

// Custom Form Module
import { CustomFormsModule } from 'ng2-validation';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		FormsModule,
		RouterModule,

		// PrimeNG
		DropdownModule,
		SpinnerModule,
		SelectButtonModule,
		CheckboxModule,
		CalendarModule,
		AccordionModule,
		AutoCompleteModule,
		MultiSelectModule,
		RadioButtonModule,
		GrowlModule,
		DataTableModule,
		InputSwitchModule,
		OverlayPanelModule,
		ProgressSpinnerModule,
		DialogModule,
		TabViewModule,
		TooltipModule,
		PaginatorModule,
		ProgressBarModule,
		KeyFilterModule,

		CustomFormsModule,

		// Google Map
		Ng4GeoautocompleteModule.forRoot()
	],
	exports: [MainOrderComponent],
	providers: [OrderService],
	declarations: [
		MainOrderComponent,
		equalGridDirective,
		OrderHistoryComponent,
		DetailOrderHistoryComponent,
		TimebaseComponent,
		KmbaseComponent,
		HourlyComponent
	]
})
export class OrderModule {}
