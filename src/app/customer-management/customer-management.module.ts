import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KeyFilterModule } from 'primeng/keyfilter';

// PrimeNG
import {
	DataTableModule,
	SharedModule,
	OverlayPanelModule,
	CheckboxModule,
	InputSwitchModule,
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
	MultiSelectModule,
	GrowlModule,
	ChipsModule,
	TooltipModule,
	InputTextModule,
	PaginatorModule
} from 'primeng/primeng';

// Custom Form Validation
import { CustomFormsModule } from 'ng2-validation';

// Service
import { CustomerManagementService } from './customer-management.service';

// Component
import { OrganizationComponent } from './organization/organization.component';
import { MainCustomerComponent } from './main-customer/main-customer.component';
import { DetailCustomerComponent } from './detail-customer/detail-customer.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { AcoountComponent } from './acoount/acoount.component';
import { ApprovalComponent } from './approval/approval.component';
import { CityCoverageComponent } from './city-coverage/city-coverage.component';
import { PricePaymentComponent } from './price-payment/price-payment.component';
import { CustomerGroupComponent } from './customer-group/customer-group.component';

import { Ng2FilterPipeModule } from 'ng2-filter-pipe';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		FormsModule,
		RouterModule,

		// PrimeNG
		DataTableModule,
		SharedModule,
		OverlayPanelModule,
		CheckboxModule,
		TabViewModule,
		InputSwitchModule,
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
		MultiSelectModule,
		GrowlModule,
		ChipsModule,
		TooltipModule,
		KeyFilterModule,
		InputTextModule,
		PaginatorModule,

		// Custom Form Validation
		CustomFormsModule,

		Ng2FilterPipeModule
	],
	providers: [CustomerManagementService],
	declarations: [
		MainCustomerComponent,
		DetailCustomerComponent,
		OrganizationComponent,
		EligibilityComponent,
		AcoountComponent,
		ApprovalComponent,
		CityCoverageComponent,
		PricePaymentComponent,
		CustomerGroupComponent
	]
})
export class CustomerManagementModule {}
