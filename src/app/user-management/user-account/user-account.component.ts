import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse/papaparse.min.js';
import { Router } from '@angular/router';
import { FileUpload, Paginator } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { UserManagemenetService } from '../user-managemenet.service';
import { MainService } from '../../lib/service/main.service';
import { CustomerManagementService } from '../../customer-management/customer-management.service';

@Component({
	selector: 'app-user-account',
	templateUrl: './user-account.component.html',
	styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private selectedData: String[];
	public displayConfirm: boolean = false;
	private paginateTable: boolean = true;
	public RoleIndicatorId = null;
	public RoleId = null;
	public showPagination: boolean = true;
	public isInternal: Boolean = false;
	public loaded: Boolean = false;

	@ViewChild('filterSearch') filterSearch;
	@ViewChild('p') paginator: Paginator;

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
				field: 'EmailCorp',
				header: 'Email Corp',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'FirstName',
				header: 'First Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'LastName',
				header: 'LastName',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'NoTelp',
				header: 'Number Telphone',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'NoHandphone',
				header: 'Number Phone',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'Address',
				header: 'Address',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'OrganizationName',
				header: 'Organization Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'OrganizationId',
				header: 'Organization Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'BranchId',
				header: 'Branch Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'RoleId',
				header: 'Role Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'BusinessUnitName',
				header: 'Business Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'CustomerGroupId',
				header: 'Customer Group',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'IsActive',
				header: 'Activate User',
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
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (dataUser != null) {
			this.RoleId = dataUser.RoleId;
			if (dataUser.UserIndicator.length) {
				this.RoleIndicatorId = dataUser.UserIndicator[0].RoleIndicatorId;
			}
		}
		this.isInternal = dataUser.RoleId == 'RL-001' || dataUser.RoleId == 'RL-002';
		// Fetching Data
		this.fetchRole();
		this.creatUrl();
		this.fetchData();
		this.fetchCustomer();
		this.fetchCompanyName();
		this.fetchCustGroup();
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
	private Id: String = null;
	public EmailCorp: String;
	private Role: String;
	public FirstName: String;
	public LastName: Number;
	private Position: String;
	private BranchId: String;
	private CustomerId: String;
	private SeraGroupCompanyId: String;
	private SeraGroupCompanyName: String;
	private BusinessUnitId: String;
	private BusinessUnitName: String;
	private selectedGrade: String;
	private Gender: String;

	public NoHandphone: Number;
	public NoTelp: Number;
	public Address: String;
	public CreditCard: String;
	public CardExpired: String;
	public CardPublisher: String;
	public CardType: String;
	private NRPExternal: String;
	private NRPInternal: String;

	// Notification
	// =========================== //
	public msgs: Message[] = [];
	public msgsError: Message[] = [];

	// Fetch Data
	// =========================== //
	fetchData() {
		this.loading = true;
		this.userManagemenetService
			.getAccountUser(this.setUrl + '&page=' + this.page + '&limit=' + this.pageRows)
			.subscribe(
				res => {
					this.totalRecords = res.Data.total;
					let data;
					if (res.Data.data == undefined) {
						this.showPagination = false;
						data = res.Data;
					} else {
						data = res.Data.data;
					}
					_.map(data, x => {
						if (x.IsActive == '1') {
							x.IsActive = true;
						} else {
							x.IsActive = false;
						}
						x['user_profile_b2_b'] = x['user_profile_b2_b'][0];
						if (x.user_profile_b2b != null) {
							this.userManagemenetService
								.getOrganizationNamePerRow(x.user_profile_b2_b.OrganizationId)
								.subscribe(res => {
									if (res.Data.length > 0) {
										let org = res.Data[0];
										x['OrganizationName'] = org.OrgName;
									} else {
										x['OrganizationName'] = '-';
									}
								});
							x['OrganizationId'] = x.user_profile_b2_b.OrganizationId;
							x['CustomerGroupId'] = x.user_profile_b2_b.CustomerGroupId;
						}
						x['OrganizationName'] = '-';
						x['user_company_mapping'] = x['user_company_mapping'][0];
						if (x.user_company_mapping != null) {
							x['BusinessUnitName'] = x.user_company_mapping.BusinessUnitName;
						}
					});

					this.data = data;
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

	// Pagination
	// =========================== //
	private page = 1;
	public pageRows = 20;
	public totalRecords = 0;
	paginate(e) {
		this.loading = true;
		this.page = e.page + 1;
		this.fetchData();
	}

	private setUrl;
	public emailCorp: String = '';
	public firstName: String = '';
	public organizationId: String = '';
	creatUrl() {
		let email;
		if (this.emailCorp == null) {
			email = '';
		} else {
			email = '&EmailCorp=' + this.emailCorp;
		}
		let firstName;
		if (this.firstName == null) {
			firstName = '';
		} else {
			firstName = '&FirstName=' + this.firstName;
		}
		let orgId;
		if (this.organizationId == null) {
			orgId = '';
		} else {
			orgId = '&OrganizationId=' + this.organizationId;
		}
		this.setUrl = email + firstName + orgId;
	}

	submitFilter(event) {
		this.page = 1;
		this.paginator.changePageToFirst(event);
		this.creatUrl();
		setTimeout(() => {
			this.fetchData();
		}, 300);
	}
	//reset filter
	resetFilter(event) {
		this.page = 1;
		this.paginator.changePageToFirst(event);
		this.emailCorp = '';
		this.firstName = '';
		this.organizationId = '';
		this.creatUrl();
		setTimeout(() => {
			this.fetchData();
		}, 300);
	}

	// Dialog Configuration
	// =========================== //
	public display: boolean = false;
	public titleRemove = null;

	// Open Dialog User
	// =========================== //
	showDialog() {
		this.loaded = false;
		this.isInternal = false;
		this.isEdit = false;
		this.display = true;
		this.selectedRole = this.roles[0].value;
		this.msgs = [];

		this.Id = null;
		setTimeout(() => {
			this.loaded = true;
			let dataUser = JSON.parse(this.mainService['dataUser']);
			if (dataUser != null) {
				if (dataUser.RoleId == 'RL-001' || dataUser.RoleId == 'RL-002') {
					this.isInternal = true;
				}
			}
		}, 300);
		if (this.organizations.length != 0) {
			this.selectedOrganization = this.organizations[0].value;
		}
		var elem = document.getElementById('body').setAttribute('class', 'on');
	}

	// Close Dialog User
	// =========================== //
	closeDialog() {
		this.loaded = false;
		this.display = false;
		this.selectedUser = null;
		this.Id = null;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}

	// Update Selected user
	// =========================== //
	private selectedUser = null;
	public isEdit: Boolean = false;
	selectUpdate(e) {
		this.isEdit = true;
		this.display = true;
		this.selectedUser = e;
		this.Id = e.Id;
		this.FirstName = e.FirstName;
		this.LastName = e.LastName;
		this.BranchId = e.BranchId;
		this.EmailCorp = e.EmailCorp;
		this.selectedGender = e.Gender;
		this.NoHandphone = e.NoHandphone;
		this.NoTelp = e.NoTelp;
		this.Address = e.Address;
		this.CreditCard = e.CreditCard;
		this.CardExpired = e.CardExpired;
		this.CardPublisher = e.CardPublisher;
		this.CardType = e.CardType;
		this.NRPExternal = e.NRPExternal;
		this.NRPInternal = e.NRPInternal;

		this.isInternal = e.IsInternal == '1' ? true : false;

		this.fetchRole();
		if (e.user_profile_b2_b != undefined) {
			this.CustomerGroupId = e.user_profile_b2_b.CustomerGroupId;
			this.selectedCustomer = e.user_profile_b2_b.CustomerId;
			this.CustomerId = e.user_profile_b2_b.CustomerId;
			this.selectedOrganization = e.user_profile_b2_b.OrganizationId;
			this.fetchEligibilityDetail(this.selectedCustomer);

			this.fetchOrganizationName(this.selectedCustomer, this.selectedOrganization);
			this.fetchOrganization(this.selectedCustomer);
		}
		this.selectedRole = e.RoleId;
		if (e.user_company_mapping[0] != null) {
			this.selectedSeraGroup = e.user_company_mapping[0].CompanyId;
			this.selectedBusinessUnit = e.user_company_mapping[0].BusinessUnitId;
		}
		var elem = document.getElementById('body').setAttribute('class', 'on');
		this.selectedSeraGroup = e.user_company_mapping.CompanyId;
		this.selectedBusinessUnit = e.user_company_mapping.BusinessUnitId;
	}
	// Close Dialog Form
	// =========================== //
	closeDialogConfirm() {
		this.displayConfirm = false;
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
				this.filterCheck.push(x.UserLoginId);
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
	selectRemove(e) {
		this.displayConfirm = true;
		this.Id = e.Id;
		this.titleRemove = 'Remove ' + e.FirstName + ' ' + e.LastName;
		this.msgs = [];
	}
	removeAll() {
		this.titleRemove = 'Remove selected item';
		this.displayConfirm = true;
	}

	public submitButtonRemove: boolean = false;
	removeData() {
		this.submitButtonRemove = true;
		if (this.filterCheck.length == 0) {
			// Delete One Account
			this.userManagemenetService.deleteAccount(this.Id).subscribe(
				res => {
					this.submitButtonRemove = false;
					this.fetchData();
					this.displayConfirm = false;
					setTimeout(() => {
						this.msgs = [];
						this.msgs.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Account has been delete'
						});
					}, 500);
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.removeData();
						});
					} else {
						this.submitButtonRemove = false;
						this.displayConfirm = false;
						setTimeout(() => {
							this.msgsError = [];
							this.msgsError.push({
								severity: 'error',
								summary: err.statusText,
								detail: err.statusText
							});
						}, 500);
					}
				}
			);
		} else {
			// Delete Selected Account
			this.userManagemenetService.multiDeleteAccount(this.filterCheck).subscribe(
				res => {
					this.submitButtonRemove = false;
					this.fetchData();
					this.displayConfirm = false;
					this.filterCheck = [];
					setTimeout(() => {
						this.msgs = [];
						this.msgs.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Account has been delete'
						});
					}, 500);
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.removeData();
						});
					} else {
						this.submitButtonRemove = false;
						this.displayConfirm = false;
						setTimeout(() => {
							this.msgsError = [];
							this.msgsError.push({
								severity: 'error',
								summary: err.statusText,
								detail: err.statusText
							});
						}, 500);
					}
				}
			);
		}
	}
	// Delete selected item
	deleteSelectedAccount(arr) {
		this.submitButtonRemove = true;
		this.userManagemenetService.deleteAccount(arr).subscribe(
			res => {
				this.submitButtonRemove = false;
				this.fetchData();
				this.displayConfirm = false;
				setTimeout(() => {
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Account has been delete'
					});
				}, 500);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.deleteSelectedAccount(arr);
					});
				} else {
					this.submitButtonRemove = false;
					this.displayConfirm = false;
					setTimeout(() => {
						this.msgsError = [];
						this.msgsError.push({
							severity: 'error',
							summary: err.statusText,
							detail: err.statusText
						});
					}, 500);
				}
			}
		);
	}

	// CRUD User Account
	// =========================== //

	public submitButton: boolean = false;
	onSubmit(e) {
		e['Role'] = this.selectedRole;
		e['CustomerId'] = this.selectedCustomer;
		e['OrganizationId'] = this.selectedOrganizationName;
		e['SeraGroupCompanyName'] = _.find(this.seraGroups, {
			value: this.selectedSeraGroup
		}).label;
		e['BusinessUnitName'] = _.find(this.businessUnits, {
			value: this.selectedBusinessUnit
		}).label;
		e['IsInternal'] = this.isInternal ? 1 : 0;

		delete e['OrganizationName'];
		this.submitButton = true;

		if (this.isInternal) {
			delete e['CustomerId'];
			delete e['OrganizationId'];
			delete e['Position'];
			delete e['CustomerGroupId'];
		}

		if (this.Id == null) {
			this.userManagemenetService.postAccount(e).subscribe(
				res => {
					if (res.Status != 200) {
						this.submitButton = false;
						setTimeout(() => {
							this.msgs = [];
							this.msgs.push({
								severity: 'error',
								summary: 'Error',
								detail: res.ErrorMessage
							});
							document.getElementById('body').classList.remove('on');
						}, 500);
					} else {
						this.submitButton = false;
						this.fetchData();
						this.display = false;
						setTimeout(() => {
							this.msgs = [];
							this.msgs.push({
								severity: 'success',
								summary: 'Success',
								detail: 'Account has been add'
							});
							document.getElementById('body').classList.remove('on');
						}, 500);
					}
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.onSubmit(e);
						});
					} else {
						this.submitButton = false;
						setTimeout(() => {
							this.msgsError = [];
							this.msgsError.push({
								severity: 'error',
								summary: err.statusText,
								detail: err.statusText
							});
						}, 500);
					}
				}
			);
		} else {
			e['UserLoginId'] = this.Id;
			e['BranchId'] = this.BranchId;
			e['CustomerId'] = this.CustomerId;
			delete e['EmailCorp'];
			this.userManagemenetService.updateAccount(this.Id, e).subscribe(
				res => {
					this.submitButton = false;
					if (this.page == 0) {
						this.page = 1;
					}
					this.fetchData();
					this.display = false;
					setTimeout(() => {
						this.msgs = [];
						this.msgs.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Account has been update'
						});
						var elem = document.getElementById('body').classList.remove('on');
					}, 500);
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.onSubmit(e);
						});
					} else {
						this.submitButton = false;
						setTimeout(() => {
							this.msgsError = [];
							this.msgsError.push({
								severity: 'error',
								summary: err.statusText,
								detail: err.statusText
							});
						}, 500);
					}
				}
			);
		}
	}
	// ============================================================================== //
	// Roles
	// ============================================================================== //
	public selectedRole: string;
	public loadingRole: boolean = false;
	public roles = [];
	fetchRole() {
		this.loaded = false;
		this.loadingRole = true;
		this.userManagemenetService.getRole().subscribe(res => {
			this.loadingRole = false;
			this.roles = [];
			_.map(res.Data, (x, i) => {
				if (x.RoleDesc != 'B2C') {
					this.loaded = true;
					let obj = { label: x.RoleName, value: x.Id };
					if (this.isInternal) {
						if (x.RoleIndicatorId != 'MRI003') {
							this.roles.push(obj);
						}
					} else {
						if (x.RoleIndicatorId == 'MRI003') {
							this.roles.push(obj);
						}
					}
				}
			});
			//this.selectedRole = this.roles[0].value;
		});
	}

	// ============================================================================== //
	// Organization
	// ============================================================================== //
	private selectedOrganization: string;
	private organizations = [];
	private organizationsTreeView = [];
	fetchOrganization(id) {
		this.userManagemenetService.getOrganization(id).subscribe(res => {
			this.organizations = [];
			_.map(res.Data, x => {
				let obj = { label: x.OrgStructureName, value: x.Id };
				this.organizations.push(obj);
			});
			if (this.organizations.length != 0) {
				//this.selectedOrganization = this.organizations[0].value;
				this.fetchOrganizationName(this.selectedCustomer, this.selectedOrganization);
			}
		});

		this.userManagemenetService.getOrgStructureTree(id).subscribe(res => {
			this.organizationsTreeView = res.Data;
			if (this.selectedUser != null) {
				let findOT = _.find(this.organizationsTreeView, {
					Id: this.selectedUser.user_profile_b2_b.OrganizationId
				});
				if (findOT != undefined) {
					this.selectedOrganization = findOT.OrgStructureId;
					this.fetchOrganizationName(this.selectedCustomer, this.selectedOrganization);
				}
			}
		});
	}
	selectOrganization(e) {
		this.fetchOrganizationName(this.selectedCustomer, this.selectedOrganization);
	}

	// ============================================================================== //
	// Organization Name
	// ============================================================================== //
	private selectedOrganizationName: string;
	private organizationNames = [];
	fetchOrganizationName(CustomerId, OrganizationId) {
		this.userManagemenetService.getOrganizationName(CustomerId, OrganizationId).subscribe(
			res => {
				this.organizationNames = [];
				_.map(res.Data, x => {
					let obj = { label: x.OrgName, value: x.Id };
					this.organizationNames.push(obj);
				});
				if (this.selectedUser != null) {
					this.selectedOrganizationName = this.selectedUser.user_profile_b2_b.OrganizationId;
				} else {
					if (res.Data.length) {
						this.selectedOrganizationName = this.organizationNames[0].value;
					}
				}
			},
			err => {
				if (err.name == 'TimeoutError') {
					this.fetchOrganizationName(CustomerId, OrganizationId);
				}

				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchOrganizationName(CustomerId, OrganizationId);
					});
				}
			}
		);
	}

	// ============================================================================== //
	// CSV Properties
	// ============================================================================== //
	public displayUploadCsv: boolean = false;
	public submitButtonCsv: boolean = false;
	public arrObjCsv = [];

	@ViewChild('fileInput') fileInput: FileUpload;

	// CSV Convert File to Object
	// =========================== //
	onFileSelect(file: File) {
		this.arrObjCsv = [];
		Papa.parse(file, {
			complete: results => {
				let keys = results.data[0];
				_.map(results.data, (x, i) => {
					let obj = _.zipObject(keys, x);
					if (i != 0) {
						this.arrObjCsv.push(obj);
					}
				});
			}
		});
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 50);
	}

	// Post CSV
	// =========================== //
	postCsv() {
		this.submitButtonCsv = true;
		_.map(this.arrObjCsv, x => {
			x.Gender = x.Gender == 'Male' ? 1 : 0;
			x['IsInternal'] = 0;
		});
		this.userManagemenetService.postCSVAccount(this.arrObjCsv).subscribe(
			res => {
				this.submitButtonCsv = false;
				this.fetchData();
				this.fileInput.clear();
				this.arrObjCsv = [];
				this.closeDialogCsv();
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Account has been add'
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.postCsv();
					});
				} else {
					this.submitButton = false;
					this.msgs = [];
					this.msgs.push({
						severity: 'error',
						summary: err.statusText,
						detail: err.statusText
					});
				}
			}
		);
	}

	// Export All Data
	// =========================== //
	downloadCSV() {
		this.loading = true;
		this.userManagemenetService.getAccountAll().subscribe(res => {
			this.mainService.exportDataCsv(res.Data, 'Report User Account');
			this.loading = false;
		});
	}
	downloadXLS() {
		this.loading = true;
		this.userManagemenetService.getAccountAll().subscribe(res => {
			this.mainService.exportDataXls(res.Data, 'Report User Account');
			this.loading = false;
		});
	}
	// Remove Object CSV
	// =========================== //
	onRemoveUploadCsv() {
		this.arrObjCsv = [];
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 50);
	}

	// Open Upload CSV
	// =========================== //
	openUploadCsv() {
		this.displayUploadCsv = true;
		this.fileInput.clear();
		this.arrObjCsv = [];
	}

	// Close Upload CSV
	// =========================== //
	closeDialogCsv() {
		this.displayUploadCsv = false;
		this.fileInput.clear();
		this.arrObjCsv = [];
	}

	// Activate
	handleChange(e, data) {
		this.loading = true;
		this.page = this.page == 0 ? 1 : this.page;
		if (e.checked) {
			this.userManagemenetService.putActivate('1', data.Id).subscribe(
				res => {
					this.fetchData();
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Status has been active'
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.handleChange(e, data);
						});
					} else {
						this.fetchData();
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: err.statusText,
							detail: err.statusText
						});
					}
				}
			);
		} else {
			this.userManagemenetService.putActivate(null, data.Id).subscribe(
				res => {
					this.fetchData();
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Status has no activated'
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.handleChange(e, data);
						});
					} else {
						this.fetchData();
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: err.statusText,
							detail: err.statusText
						});
					}
				}
			);
		}
	}

	// ============================================================================== //
	// Customers Type
	// ============================================================================== //
	private customers = [];
	private selectedCustomer = null;
	private disableCustomer: boolean = false;
	fetchCustomer() {
		this.customers = [];
		this.userManagemenetService.getCustomer().subscribe(
			res => {
				_.map(res.Data, x => {
					let obj = {
						value: x.CustomerId,
						label: x.CustomerName
					};
					this.customers.push(obj);
				});
				//this.selectedCustomer = this.customers[0].value;
				this.fetchEligibilityDetail(this.selectedCustomer);
				this.fetchOrganization(this.selectedCustomer);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCustomer();
					});
				}
			}
		);
	}
	selectCustomer(e) {
		this.fetchEligibilityDetail(e.value);
		this.fetchOrganization(this.selectedCustomer);
	}

	// ============================================================================== //
	// Company Name
	// ============================================================================== //
	public seraGroups = this.mainService['seraGroups'];
	public selectedSeraGroup = null;
	fetchCompanyName() {
		// this.seraGroups = [];
		// this.userManagemenetService.getCompanyName().subscribe(res =>{
		// 	console.log(res);
		//     _.map(res.Data, (x)=>{
		//         let obj = {
		//             value: x.CustomerId,
		//             label: x.CustomerName
		//         };
		//         this.seraGroups.push(obj);
		//     });
		//     this.selectedSeraGroup = this.seraGroups[0].value;
		// }, err =>{
		// 	if(err.status == 401){
		// this.mainService.updateToken(() =>{
		// 	this.fetchCompanyName();
		// });
		//     }
		// });
	}
	selectSeraGroup(e) {}

	// ============================================================================== //
	// Company Name
	// ============================================================================== //
	public businessUnits = this.mainService['businessUnits'];
	public selectedBusinessUnit = null;
	getBusinessUnit() {
		// this.businessUnits = [];
		// this.userManagemenetService.getCompanyName('29292').subscribe(res =>{
		// 	console.log(res);
		//     _.map(res.Data, (x)=>{
		//         let obj = {
		//             value: x.CustomerId,
		//             label: x.CustomerName
		//         };
		//         this.businessUnits.push(obj);
		//     });
		//     this.selectedBusinessUnit = this.businessUnits[0].value;
		// }, err =>{
		// 	if(err.status == 401){
		// this.mainService.updateToken(() =>{
		// 	this.getBusinessUnit();
		// });
		//     }
		// });
	}
	selectBusinessUnit(e) {}

	// ============================================================================== //
	// Genders
	// ============================================================================== //
	public genders = [
		{ label: 'Male', value: '1' },
		{ label: 'Female', value: '0' }
	];
	public selectedGender = this.genders[0].value;

	// Fetch Detail Eligibility
	// =========================== //
	private arrPositionGrade = [];
	fetchEligibilityDetail(id) {
		this.userManagemenetService.getDetailELigibility(id).subscribe(
			res => {
				this.arrPositionGrade = [];
				_.map(res.Data.EligibilityDetail, x => {
					let setArr = x.EligibilityType.split(',');
					_.map(setArr, n => {
						let obj;
						if (n == '') {
							obj = { label: 'None', value: 'None' };
						} else {
							obj = { label: n, value: n };
						}
						this.arrPositionGrade.push(obj);
					});
				});

				this.arrPositionGrade = _.uniqBy(this.arrPositionGrade, 'label'); //modify 04-10-19 request by angger

				if (this.selectedUser != null) {
					this.selectedGrade = this.selectedUser.user_profile_b2_b.PositionId;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchEligibilityDetail(id);
					});
				} else {
					this.submitButton = false;
					this.msgs = [];
					this.msgs.push({
						severity: 'error',
						summary: err.statusText,
						detail: err.statusText
					});
				}
			}
		);
	}

	// Fetch Data
	// =========================== //
	private groupconfigs = [];
	private CustomerGroupId;
	fetchCustGroup() {
		this.customerSerive.getCustomerGroup().subscribe(
			res => {
				this.groupconfigs = [];
				_.map(res.Data, x => {
					let obj = { label: x.CustGroupDesc, value: x.CustGroupId };
					this.groupconfigs.push(obj);
				});
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
}
