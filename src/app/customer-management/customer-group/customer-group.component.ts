import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { MainService } from '../../lib/service/main.service';
import { UserManagemenetService } from '../../user-management/user-managemenet.service';
import { CustomerManagementService } from '../customer-management.service';

@Component({
	selector: 'app-customer-group',
	templateUrl: './customer-group.component.html',
	styleUrls: ['./customer-group.component.scss']
})
export class CustomerGroupComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	public selectedValues: string[];
	public selectedData: String[];
	public displayConfirm: boolean = false;
	private paginateTable: boolean = true;

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private mainService: MainService,
		private router: Router,
		private messageService: MessageService,
		private userManagemenetService: UserManagemenetService,
		private customerSerive: CustomerManagementService
	) {}

	ngOnInit() {
		this.cols = [
			{
				field: 'CustGroupId',
				header: 'Group Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: true
			},
			{
				field: 'CustGroupDesc',
				header: 'Description',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			}
		];

		let filterChecked = [];
		_.map(this.cols, x => {
			if (x.checked) {
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;

		this.fetchData();
	}

	// Toggle Checkbox Columns
	// =========================== //
	checkBox(e) {
		if (e.checked) {
			e.checked = false;
		} else {
			e.checked = true;
		}
	}

	// ============================================================================== //
	// User Account Profile
	// ============================================================================== //

	// Field
	// =========================== //
	public Id = null;
	private CustGroupId: String;
	public CustGroupDesc: String;

	// Notification
	// =========================== //
	public msgs: Message[] = [];
	public msgsError: Message[] = [];

	// Fetch Data
	// =========================== //
	fetchData() {
		this.loading = true;
		this.customerSerive.getCustomerGroup().subscribe(
			res => {
				this.data = res.Data;
				this.loading = false;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchData();
					});
				}
			}
		);
	}

	// Table Check Configuration
	// =========================== //
	private filterCheck = [];
	public selectAll: boolean = false;

	// Toggle Check All
	// =========================== //
	checkAll(e) {
		this.selectAll = e;
		if (e) {
			this.filterCheck = [];
			_.map(this.data, x => {
				this.filterCheck.push(x.CustGroupId);
			});
			this.selectedData = this.filterCheck;
		} else {
			this.selectedData = [];
			this.filterCheck = [];
		}
	}

	// Check row
	// =========================== //
	checkOne(e, value) {
		if (e) {
			this.filterCheck.push(value);
		} else {
			_.remove(this.filterCheck, x => {
				return x == value;
			});
		}

		if (this.filterCheck.length >= 1) {
			this.selectAll = true;
		} else {
			this.selectAll = false;
		}
	}

	// Dialog remove Selected user
	// =========================== //
	public titleRemove = null;
	selectRemove(e) {
		this.displayConfirm = true;
		this.Id = e.Id;
		this.CustGroupId = e.CustGroupId;
		this.titleRemove = 'Remove ' + e.CustGroupId;
		this.msgs = [];
	}
	removeAll() {
		this.titleRemove = 'Remove selected item';
		this.displayConfirm = true;
	}

	// Close Dialog Form
	// =========================== //
	closeDialogConfirm() {
		this.displayConfirm = false;
	}

	public submitButtonRemove: boolean = false;
	removeData() {
		this.submitButtonRemove = true;
		this.customerSerive.deleteCustomerGroup(this.CustGroupId).subscribe(
			res => {
				this.displayConfirm = false;
				this.submitButtonRemove = false;
				this.msgs = [];
				this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Success Delete' });
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchData();
					});
				}
				this.submitButtonRemove = false;
				this.msgsError = [];
				this.msgsError.push({ severity: 'error', summary: 'Error', detail: 'Failed Delete' });
			}
		);
	}

	// Submit Form
	// =========================== //
	public submitButton: boolean = false;
	submitForm(e) {
		this.submitButton = true;
		if (this.Id == null) {
			this.customerSerive.postCustomerGroup(e).subscribe(
				res => {
					this.submitButton = false;
					this.fetchData();
					this.msgs = [];
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Success add' });
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchData();
						});
					}
					this.submitButton = false;
					this.msgs = [];
					this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Error add' });
				}
			);
		} else {
			this.customerSerive.putCustomerGroup(e, this.CustGroupId).subscribe(
				res => {
					this.submitButton = false;
					this.fetchData();
					this.clearUpdate();
					this.msgs = [];
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Success update' });
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchData();
						});
					}
					this.submitButton = false;
					this.msgs = [];
					this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Error update' });
				}
			);
		}
	}

	// Select Update
	// ============================= //
	selectUpdate(e) {
		this.Id = e.Id;
		this.CustGroupDesc = e.CustGroupDesc;
		this.CustGroupId = e.CustGroupId;
	}
	clearUpdate() {
		this.Id = null;
		this.CustGroupDesc = null;
		this.CustGroupId = null;
	}
}
