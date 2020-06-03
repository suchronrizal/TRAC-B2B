import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProductComponent } from './product/product.component';
import { ProductPriceService } from './product-price.service';

// PrimeNG
import {
	DataTableModule,
	SharedModule,
	OverlayPanelModule,
	CheckboxModule,
	TabViewModule,
	OrganizationChartModule,
	AutoCompleteModule,
	SelectButtonModule,
	SpinnerModule,
	ProgressBarModule,
	CalendarModule,
	ProgressSpinnerModule,
	DialogModule,
	DropdownModule,
	InputMaskModule,
	FileUploadModule,
	InputSwitchModule,
	RadioButtonModule,
	GrowlModule
} from 'primeng/primeng';
import { CustomFormsModule } from 'ng2-validation';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		FormsModule,
		RouterModule,

		// PrimeNG
		DataTableModule,
		InputSwitchModule,
		SharedModule,
		OverlayPanelModule,
		CheckboxModule,
		TabViewModule,
		OrganizationChartModule,
		AutoCompleteModule,
		SelectButtonModule,
		SpinnerModule,
		ProgressBarModule,
		CalendarModule,
		ProgressSpinnerModule,
		DialogModule,
		DropdownModule,
		InputMaskModule,
		FileUploadModule,
		RadioButtonModule,
		GrowlModule,

		// Custom Module
		CustomFormsModule
	],
	declarations: [ProductComponent],
	exports : [ProductComponent],
	providers: [ProductPriceService]
})
export class ProductPriceManagementModule { }
