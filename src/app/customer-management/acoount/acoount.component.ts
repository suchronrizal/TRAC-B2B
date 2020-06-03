import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as Papa from 'papaparse/papaparse.min.js';
import { CustomerManagementService } from '../customer-management.service';

import { FileUpload, Paginator } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { UserManagemenetService } from '../../user-management/user-managemenet.service';
import { MainService } from '../../lib/service/main.service';
import { DetailCustomerComponent } from '../detail-customer/detail-customer.component';
import { validPhone, validateEmail } from '../../../assets/helper/utility';

@Component({
	selector: 'app-acoount',
	templateUrl: './acoount.component.html',
	styleUrls: ['./acoount.component.scss']
})
export class AcoountComponent implements OnInit {
	// Properties
	// ====================== //
	public submitButton2: boolean = false;
	public data = [];
	public cols: any[];
	public dataError = [];
	public colsImport: any[];
	public baseUrl: String;
	public IsOrganizationMapping: Boolean = false;
	public selectedMappingOrganization: any[];
	public showErrorImport: Boolean = false;
	public loading: boolean;
	private selectedValues: string[];
	private selectedData: String[];
	public displayConfirm: boolean = false;

	// Set Input
	// ====================== //

	private costCenter = [
		{ label: 'CIST', value: 'CC-0001' },
		{ label: 'Finance', value: 'CC-0002' },
		{ label: 'HRGA', value: 'CC-0003' },
		{ label: 'Operation', value: 'CC-0004' }
	];

	@ViewChild('filterSearch') filterSearch;
	@ViewChild('p') paginator: Paginator;

	@Input() disableNext: boolean;
	@Input() groupName: any;
	@Input() isOpen: boolean;
	@Output() onSave = new EventEmitter();

	constructor(
		private mainService: MainService,
		private messageService: MessageService,
		private userManagemenetService: UserManagemenetService,
		private detailCustomer: DetailCustomerComponent,
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
			}
		];

		let filterChecked = [];
		_.map(this.cols, x => {
			if (x.checked) {
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;

		this.colsImport = [
			{
				field: 'ErrorLine',
				header: 'Error Line'
			},
			{
				field: 'ErrorMessage',
				header: 'Error Message'
			}
		];
	}

	ngOnChanges() {
		this.baseUrl = this.mainService['baseUrl'];
		// if(this.isOpen){
		// Fetching Data
		this.fetchRole();
		this.fetchOrganization();
		this.fetchData();
		this.creatUrl();
		this.fetchCustGroup();
		this.fetchEligibilityDetail(this.detailCustomer['CustomerId']);
		// }
		this.filtergroupconfigs = _.filter(this.groupconfigs, { value: this.groupName });
	}

	// Toggle Checkbox
	// ====================== //
	checkBox(e) {
		if (e.checked) {
			e.checked = false;
		} else {
			e.checked = true;
		}
		this.IsOrganizationMapping = e;
		this.fetchMappingOrganization();
	}

	public loadingOrgName: Boolean = false;
	private mappingOrganizations = [];
	fetchMappingOrganization() {
		this.loadingOrgName = true;
		if (this.IsOrganizationMapping) {
			this.customerSerive.getOrgStructureTree(this.detailCustomer['CustomerId']).subscribe(
				res => {
					this.mappingOrganizations = [];
					let data = res.Data;
					if (data.length != 0) {
						_.map(data, x => {
							let obj = {
								label: x.OrgName,
								value: x.Id
							};
							this.mappingOrganizations.push(obj);
						});
						this.loadingOrgName = false;
					}
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchMappingOrganization();
						});
					}
				}
			);
		}
	}
	// Save Data
	// ====================== //
	save() {
		this.onSave.emit();
		this.detailCustomer.updateConfigStep('2');
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
	private TopDays: Number;
	private Position: String;
	private BranchId: String;
	private CustomerId: String;
	private SeraGroupCompanyId: String;
	private SeraGroupCompanyName: String;
	private BusinessUnitId: String;
	private BusinessUnitName: String;
	private Gender: String;
	public CustomerGroupId: String;

	public NoHandphone: Number;
	public NoTelp: Number;
	public Address: String;
	public CreditCard: String;
	public CardExpired: Date;
	public CardPublisher: String;
	public CardType: String;
	public NRPExternal: String;
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
			.getAccountByCustomerPaginate(
				this.setUrl + '&page=' + this.page + '&limit=' + this.pageRows,
				this.detailCustomer['CustomerId']
			)
			.subscribe(
				res => {
					this.data = res.Data != null && res.Data.data;
					this.totalRecords = res.Data != null && res.Data.total;
					this.loading = false;
					_.map(this.data, x => {
						x['UserCompanyMapping'] = x['user_company_mapping'][0];
						x['UserProfileB2B'] = x['user_profile_b2b'][0];
						x['OrganizationId'] = x.user_profile_b2b.OrganizationId;
						x['CustomerGroupId'] = x.user_profile_b2b.CustomerGroupId;

						if (x.user_company_mapping != null) {
							x['BusinessUnitName'] = x.user_company_mapping.BusinessUnitName;
						} else {
							x['BusinessUnitName'] = null;
						}
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchData();
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchData();
					}
				}
			);
	}

	// Pagination
	// =========================== //
	public page = 1;
	public pageRows = 20;
	public totalRecords = 0;
	paginate(e) {
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
		this.display = true;
		this.selectedRole = this.roles[0].value;
		this.selectedOrganization = this.organizations[0].value;
		this.msgs = [];
		this.Id = null;
		var elem = document.getElementById('body').setAttribute('class', 'on');
	}

	// Close Dialog User
	// =========================== //
	closeDialog() {
		this.IsOrganizationMapping = false;
		this.selectedUser = null;
		this.display = false;
		this.Id = null;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}

	// Update Selected user
	// =========================== //
	private selectedUser = null;
	selectUpdate(e) {
		this.selectedUser = e;
		this.display = true;
		this.Id = e.Id;
		this.FirstName = e.FirstName;
		this.LastName = e.LastName;
		this.selectedRole = e.RoleId;
		this.BranchId = e.BranchId;
		this.CustomerId = e.user_profile_b2b && e.user_profile_b2b.CustomerId;
		this.EmailCorp = e.EmailCorp;
		this.selectedGender = e.Gender;
		this.Address = e.Address;
		this.TopDays = e.user_profile_b2b && e.user_profile_b2b.TopDays;
		this.NoHandphone = e.NoHandphone;
		this.NoTelp = e.NoTelp;
		this.Address = e.Address;
		this.CreditCard = e.CreditCard;
		this.CardExpired = e.CardExpired;
		this.CardPublisher = e.CardPublisher;
		this.CardType = e.CardType;
		this.NRPExternal = e.NRPExternal;
		this.NRPInternal = e.NRPInternal;
		if (e.IsOrganizationMapping == '1') {
			this.checkBox(true);
		}
		this.selectedMappingOrganization = [];
		_.map(e.user_organization_mapping, x => {
			this.selectedMappingOrganization.push(x.OrganizationId);
		});
		var elem = document.getElementById('body').setAttribute('class', 'on');

		let findOT = _.find(this.organizationsTreeView, { Id: e.user_profile_b2b.OrganizationId });
		if (findOT != undefined) {
			this.selectedOrganization = findOT.OrgStructureId;
			this.fetchOrganizationName(this.selectedOrganization);
			this.fetchEligibilityDetail(this.detailCustomer['CustomerId']);
		}
		this.CustomerGroupId = e.user_profile_b2b.CustomerGroupId;
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
				this.filterCheck.push(x.Id);
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
						this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Account has been delete' });
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
							this.msgsError.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
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
						this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Account has been delete' });
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
							this.msgsError.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
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
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Account has been delete' });
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
						this.msgsError.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
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
		e['CustomerId'] = this.detailCustomer['CustomerId'];
		e['OrganizationId'] = this.selectedOrganizationName;
		e['SeraGroupCompanyName'] = _.find(this.seraGroups, { value: this.selectedSeraGroup }).label;
		e['BusinessUnitName'] = _.find(this.businessUnits, { value: this.selectedBusinessUnit }).label;
		e['IsInternal'] = 0;
		e['CreaditCard'] = e.cardnumber;
		delete e['OrganizationName'];
		delete e['cardnumber'];
		this.submitButton = true;
		if (this.Id == null) {
			this.userManagemenetService.postAccount(e).subscribe(
				res => {
					if (res.Status != 200) {
						this.submitButton = false;
						this.IsOrganizationMapping = false;
						setTimeout(() => {
							this.msgs = [];
							this.msgs.push({ severity: 'error', summary: 'Error', detail: res.ErrorMessage });
							document.getElementById('body').classList.remove('on');
						}, 500);
					} else {
						this.submitButton = false;
						this.IsOrganizationMapping = false;
						this.fetchData();
						this.display = false;
						setTimeout(() => {
							this.msgs = [];
							this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Account has been add' });
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
							this.msgsError.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
						}, 500);
					}
				}
			);
		} else {
			e['Id'] = this.Id;
			e['BranchId'] = this.BranchId;
			e['CustomerId'] = this.CustomerId;
			e['TopDays'] = this.TopDays;
			e['CreditCard'] = this.CreditCard;
			delete e['EmailCorp'];
			delete e['cardnumber'];
			this.userManagemenetService.updateAccount(this.Id, e).subscribe(
				res => {
					this.submitButton = false;
					this.IsOrganizationMapping = false;
					this.fetchData();
					this.display = false;
					setTimeout(() => {
						this.msgs = [];
						this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Account has been update' });
						var elem = document.getElementById('body').classList.remove('on');
					}, 500);
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.onSubmit(e);
						});
					} else {
						this.IsOrganizationMapping = false;
						this.submitButton = false;
						setTimeout(() => {
							this.msgsError = [];
							this.msgsError.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
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
	public roles = [];
	fetchRole() {
		this.userManagemenetService.getRole().subscribe(res => {
			this.roles = [];
			_.map(res.Data, x => {
				if (x.RoleDesc != 'B2C' && x.RoleIndicatorId == 'MRI003') {
					let obj = { label: x.RoleName, value: x.Id };
					this.roles.push(obj);
				}
			});
		});
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
				//this.arrObjCsv=results.data;
				let keys = results.data[0];
				let check = _.filter(results.data, key => {
					return key != '';
				});
				_.map(check, (x, i) => {
					let obj = _.zipObject(keys, x);
					if (i != 0) {
						this.arrObjCsv.push(obj);
					}
				});
			}
		});
	}

	// Post CSV
	// =========================== //
	private dataErrorUpload = [];
	postCsv() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let obj = this.arrObjCsv;
		let empty = true;
		let errorIndividual = [];
		let ErrorLine = [];
		let objDataError = {};
		this.dataErrorUpload = [];
		Object.keys(obj).forEach(key => {
			if (
				obj[key].FirstName == '' ||
				obj[key].EmailCorp == '' ||
				obj[key].BusinessUnitName == '' ||
				obj[key].CustomerId == '' ||
				obj[key].OrganizationId == '' ||
				obj[key].Position == '' ||
				obj[key].Role == '' ||
				obj[key].SeraGroupCompanyId == '' ||
				obj[key].SeraGroupCompanyName == '' ||
				obj[key].NoHandphone == ''
			)
				empty = false;
			obj[key].BusinessUnitId = dataUser.UserCompanyMapping[0].BusinessUnitId;
			let errorCustomer = null;
			let errorBusinessUnitId = null;
			let errorEmailCorp = null;
			let errorPhone = null;
			let errorRole = null;
			let errorOrganization = null;
			let errorLine: any;
			let i = Number(key) + 1;
			if (obj[key].CustomerId != this.detailCustomer['CustomerId']) {
				errorLine = i;
				errorCustomer = `CutomerId must be ${this.detailCustomer['CustomerId']}.`;
			}
			let businessId = Number(obj[key].BusinessUnitId);
			if (`0${businessId}`.toString() != dataUser.UserCompanyMapping[0].BusinessUnitId.toString()) {
				errorLine = i;
				errorBusinessUnitId = `BusinessUnitId must be ${dataUser.UserCompanyMapping[0].BusinessUnitId}.`;
			}
			if (!validateEmail(obj[key].EmailCorp)) {
				errorLine = i;
				errorEmailCorp = 'Incorrect Your Email';
			}
			if (!validPhone(obj[key].NoHandphone)) {
				errorLine = i;
				errorPhone = 'Phone Min 10 Digits';
			}
			let findRole = _.find(this.roles, { value: obj[key].Role });
			if (findRole == undefined) {
				errorLine = i;
				errorRole = 'Incorrect Your Role';
			}
			if (
				obj[key].CustomerId == this.detailCustomer['CustomerId'] &&
				`0${businessId}`.toString() == dataUser.UserCompanyMapping[0].BusinessUnitId.toString()
			) {
				let findCustOrg = _.find(this.organizationsTreeView, { Id: obj[key].OrganizationId });
				if (findCustOrg == undefined) {
					errorLine = i;
					errorOrganization = `CustomerId (${obj[key].CustomerId}) Doesn't Have an OrganizationId (${obj[key].OrganizationId})`;
				}
			}
			if (errorLine != undefined) {
				objDataError = {
					index: ErrorLine[key] = errorLine,
					message: errorIndividual[key] = [
						errorCustomer,
						errorBusinessUnitId,
						errorEmailCorp,
						errorPhone,
						errorRole,
						errorOrganization
					]
				};
				this.dataErrorUpload.push(objDataError);
			}
		});
		//console.log(this.arrObjCsv);
		if (!empty) {
			this.msgs = [];
			this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Invalid Data, Please check your file import' });
			return false;
		} else {
			this.showErrorImport = false;
			if (this.dataErrorUpload.length > 0) {
				this.showErrorImport = true;
				this.dataError = this.dataErrorUpload;
				this.fetchErrorImportCSV();
			} else {
				this.loading = true;
				this.submitButtonCsv = true;
				this.showErrorImport = false;
				this.userManagemenetService.postCSVAccount(this.arrObjCsv).subscribe(
					res => {
						if (res.ErrorMessage.length > 0) {
							this.dataError = res.ErrorMessage;
							this.showErrorImport = true;
							this.loading = false;
							this.submitButtonCsv = false;
							this.fetchErrorImportCSV();
						} else {
							this.showErrorImport = false;
							this.submitButtonCsv = false;
							this.displayUploadCsv = false;
							this.loading = false;
							this.fetchData();
							this.fileInput.clear();
							this.arrObjCsv = [];
							this.msgs = [];
							this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Account has been added' });
						}
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.postCsv();
							});
						} else {
							this.submitButton = false;
							this.msgs = [];
							this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
						}
					}
				);
			}
		}
	}

	fetchErrorImportCSV() {
		_.map(this.dataError, item => {
			item['ErrorLine'] = item.index + 1;
			item['ErrorMessage'] = _.filter(item.message, x => x != null).join(' - ');
		});
	}

	// Export All Data
	// =========================== //
	downloadCSV() {
		this.loading = true;
		this.userManagemenetService.getAccountByCustomer(this.detailCustomer['CustomerId']).subscribe(res => {
			if (res.Data.length > 0) {
				let tmpPush = [];
				let resObj = res.Data;
				_.map(resObj, val => {
					let objExport = {
						'Email Corp': val.EmailCorp,
						'First Name': val.FirstName,
						'Last Name': val.LastName,
						'Number Telephone': val.NoTelp,
						'Number Phone': val.NoHandphone,
						Address: val.Address,
						'Organization Id': (val.UserProfileB2B[0] && val.UserProfileB2B[0].OrganizationId) || '-',
						'Role Id': val.RoleId,
						'Business Name': (val.UserCompanyMapping[0] && val.UserCompanyMapping[0].BusinessUnitName) || '-',
						'Customer Grup': (val.UserProfileB2B[0] && val.UserProfileB2B[0].CustomerGroupId) || '-'
					};
					tmpPush.push(objExport);
				});
				this.mainService.exportDataCsv(tmpPush, 'Report User Account');
				this.loading = false;
			}
		});
	}

	downloadXLS() {
		this.loading = true;
		this.userManagemenetService.getAccountByCustomer(this.detailCustomer['CustomerId']).subscribe(res => {
			if (res.Data.length > 0) {
				let tmpPush = [];
				let resObj = res.Data;
				_.map(resObj, val => {
					let objExport = {
						'Email Corp': val.EmailCorp,
						'First Name': val.FirstName,
						'Last Name': val.LastName,
						'Number Telephone': val.NoTelp,
						'Number Phone': val.NoHandphone,
						Address: val.Address,
						'Organization Id': (val.UserProfileB2B[0] && val.UserProfileB2B[0].OrganizationId) || '-',
						'Role Id': val.RoleId,
						'Business Name': (val.UserCompanyMapping[0] && val.UserCompanyMapping[0].BusinessUnitName) || '-',
						'Customer Grup': (val.UserProfileB2B[0] && val.UserProfileB2B[0].CustomerGroupId) || '-'
					};
					tmpPush.push(objExport);
				});
				this.mainService.exportDataXls(tmpPush, 'Report User Account');
				this.loading = false;
			}
		});
	}

	// Remove Object CSV
	// =========================== //
	onRemoveUploadCsv() {
		this.arrObjCsv = [];
	}

	// Open Upload CSV
	// =========================== //
	public loaded: Boolean = true;
	openUploadCsv() {
		this.loaded = false;
		this.displayUploadCsv = true;
		this.fileInput.clear();
		this.arrObjCsv = [];
		setTimeout(() => {
			this.loaded = true;
		}, 300);
	}

	// Close Upload CSV
	// =========================== //
	closeDialogCsv() {
		this.showErrorImport = false;
		this.dataError = [];
		this.displayUploadCsv = false;
		this.fileInput.clear();
		this.arrObjCsv = [];
	}

	// Activate
	// =========================== //
	handleChange(e, data) {
		this.loading = true;
		if (e.checked) {
			this.userManagemenetService.putActivate('1', data.Id).subscribe(
				res => {
					this.fetchData();
					this.msgs = [];
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Status has been active' });
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.handleChange(e, data);
						});
					} else {
						this.fetchData();
						this.msgs = [];
						this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
					}
				}
			);
		} else {
			this.userManagemenetService.putActivate(null, data.Id).subscribe(
				res => {
					this.fetchData();
					this.msgs = [];
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Status has no activated' });
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.handleChange(e, data);
						});
					} else {
						this.fetchData();
						this.msgs = [];
						this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
					}
				}
			);
		}
	}

	// Genders
	// =========================== //
	public genders = [
		{ label: 'Male', value: '1' },
		{ label: 'Female', value: '0' }
	];
	public selectedGender = this.genders[0].value;

	// ============================================================================== //
	// Organization
	// ============================================================================== //
	public selectedOrganization: string;
	public organizations = [];
	private organizationsTreeView = [];
	fetchOrganization() {
		this.customerSerive.getOrganizationByCustomer(this.detailCustomer['CustomerId']).subscribe(res => {
			this.organizations = [];
			_.map(res.Data, x => {
				let obj = { label: x.OrgStructureName, value: x.Id };
				this.organizations.push(obj);
			});

			if (this.organizations.length != 0) {
				this.selectedOrganization = this.organizations[0].value;
				this.fetchOrganizationName(this.selectedOrganization);
			}
		});

		this.customerSerive.getOrgStructureTree(this.detailCustomer['CustomerId']).subscribe(res => {
			this.organizationsTreeView = res.Data;
		});
	}
	selectOrganization(e) {
		this.fetchOrganizationName(this.selectedOrganization);
	}

	// ============================================================================== //
	// Organization Name
	// ============================================================================== //
	public selectedOrganizationName: string;
	public organizationNames = [];
	fetchOrganizationName(OrganizationId) {
		this.customerSerive.getOrganizationName(this.detailCustomer['CustomerId'], OrganizationId).subscribe(res => {
			this.organizationNames = [];

			if (res.Data.length) {
				_.map(res.Data, x => {
					let obj = { label: x.OrgName, value: x.Id };
					this.organizationNames.push(obj);
				});

				if (this.selectedUser != null) {
					this.selectedOrganizationName = this.selectedUser.user_profile_b2b.OrganizationId;
				} else {
					this.selectedOrganizationName = this.organizationNames[0].value;
				}
			}
		});
	}

	// Fetch Detail Eligibility
	// =========================== //
	public arrPositionGrade = [];
	public selectedGrade;
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
					this.selectedGrade = this.selectedUser.user_profile_b2b.PositionId;
				} else {
					if (!_.isEmpty(this.arrPositionGrade)) {
						this.selectedGrade = this.arrPositionGrade[0].value;
					}
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
					this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
				}
			}
		);
	}

	// Fetch Data
	// =========================== //
	private groupconfigs = [];
	public filtergroupconfigs = [];
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

	// Company Name
	// =========================== //
	public seraGroups = this.mainService['seraGroups'];
	public selectedSeraGroup = null;
	selectSeraGroup(e) {}

	// Company Name
	// =========================== //
	public businessUnits = this.mainService['businessUnits'];
	public selectedBusinessUnit = null;
	selectBusinessUnit(e) {}
}
