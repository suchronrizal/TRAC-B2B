import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BillingService } from './billing.service';
import { MainBillingComponent } from './main-billing/main-billing.component';

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
	GrowlModule,
	TooltipModule,
	PaginatorModule
} from 'primeng/primeng';
import { CustomFormsModule } from 'ng2-validation';
import { TransactionComponent } from './transaction/transaction.component';

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
		TooltipModule,
		PaginatorModule,

		// Custom Module
		CustomFormsModule
	],
	providers : [BillingService],
	declarations: [MainBillingComponent, TransactionComponent]
})
export class BillingModule { }
