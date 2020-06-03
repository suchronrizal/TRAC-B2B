import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { store } from '../../lib/service/reducer.service';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { UserManagemenetService } from '../../user-management/user-managemenet.service';
import { CustomerManagementService } from '../customer-management.service';
import { DetailCustomerComponent } from '../detail-customer/detail-customer.component';
import { MainService } from '../../lib/service/main.service';

@Component({
	selector: 'app-approval',
	templateUrl: './approval.component.html',
	styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public msgs: Message[] = [];
	private disableMultiSelect: boolean = false;
	private objScheme;
	public loading: boolean = true;

	@Input() disableNext: boolean;
	@Input() isOpen: boolean;
	@Output() onSave = new EventEmitter();

	constructor(
		private messageService: MessageService,
		private mainService: MainService,
		private detailCustomer: DetailCustomerComponent,
		private cmService: CustomerManagementService,
		private userManagemenetService: UserManagemenetService
	) {}

	ngOnInit() {
		// this.fetchGetApprovalDirect();
		this.objScheme = {
			ApprovalSchemaId: null,
			ApprovalDirectTypeId: null,
			ApprovalLevel: null,
			ApprovalLimit: null,
			ExecutionTypeId: null,
			CustomerId: this.detailCustomer['CustomerId'],
			Notification: []
		};
	}

	ngOnChanges() {
		if (this.isOpen) {
			this.loading = true;
			this.fetchDataApprovalScheme();
		}
	}

	// ============================================================================== //
	// Fetch Data
	// ============================================================================== //
	public isNull: boolean = true;
	private ApprovalId = null;
	private emplyersLevel = [];
	fetchDetailCustomer() {
		this.cmService.getDetailByCustomer(this.detailCustomer['CustomerId']).subscribe(
			res => {
				if (res.Data != '') {
					this.isNull = false;
					let obj = res.Data;
					this.ApprovalId = obj.ConfigurationApprovalId;
					this.selectedApprovalSchema = obj.ApprovalSchemaId;
					this.selectedApprovalLevel = obj.ApprovalLevel;
					this.selectDirectApprovalExecution = obj.ExecutionTypeId;
					this.selectDirectApprovalType = obj.ApprovalDirectTypeId;
					this.time = moment('2001-01-01' + ' ' + obj.ApprovalLimit)['_d'];
					this.onChangeAppovalLevel();
					this.emplyersLevel = [];
					_.map(obj.config_direct_approval, x => {
						let obj = { value: x.UserId };
						this.emplyersLevel.push(obj);
					});
					this.fetchNotifByCustomer();
					this.fetchApproverCostCenter();
					this.getOrgStructureTreeApproval();
					this.fetchCostCenter();

					store.dispatch({
						type: 'SET_APPROVAL_CONFID_ID',
						value: res.Data.ConfigurationApprovalId
					});
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDetailCustomer();
					});
				}
			}
		);
	}

	// Fetch Notif By Customer
	// =============================== //
	public selectedNotif: string[] = [];

	fetchNotifByCustomer() {
		this.cmService.getNotifByCustomer(this.detailCustomer['CustomerId']).subscribe(
			res => {
				let arr = [];
				this.selectedNotif = [];
				if (res.Data.length != 0) {
					_.map(res.Data[0].details, x => {
						arr.push(x.NotificationTypeId);
					});
					this.selectedNotif = arr;
					store.dispatch({
						type: 'SET_NOTIFICATION_CONFIG_ID',
						value: res.Data[0].ConfigurationNotificationId
					});
				}
				this.loading = false;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchNotifByCustomer();
					});
				}
			}
		);
	}
	// Notification
	// =============================== //
	private arrNotification = [];
	fetchNotification() {
		this.cmService.getNotificationType().subscribe(
			res => {
				this.arrNotification = [];
				_.map(res.Data, x => {
					let obj = {
						label: x.MsNotificationTypeName,
						value: x.MsNotificationTypeId,
						disabled: false
					};
					if (obj.value != 'MNT002') {
						obj.disabled = true;
					}
					this.arrNotification.push(obj);
				});
				this.fetchDetailCustomer();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchNotification();
					});
				}
			}
		);
	}
	//fetch approver pic cost center
	// =============================== //
	private originApproverPic = [];
	fetchApproverCostCenter() {
		this.cmService.getApproverPicCostCenter(this.detailCustomer['CustomerId']).subscribe(
			res => {
				if (res.Data.length > 0) {
					this.originApproverPic = [];
					_.map(res.Data, val => {
						let obj = {
							CostCenterId: val.Id,
							arrPics: [],
							loading: true
						};
						if (this.selectedApprovalSchema == 'MAS0002') {
							let userDirect = [];
							if (val.direct_approver.length) {
								_.map(val.direct_approver, x => {
									let obj = {
										UserId: x.UserId,
										Email: x.Email
									};
									userDirect.push(obj);
								});
								obj['selectedPic'] = userDirect;
							}
						}
						this.originApproverPic.push(obj);
					});
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchApproverCostCenter();
					});
				}
				if (err.name == 'TimeoutError') {
					this.fetchApproverCostCenter();
				}
			}
		);
	}
	// fetch organizationByPic
	// =============================== //
	private originOrg = [];
	private organizationId = null;
	getOrgStructureTreeApproval() {
		this.cmService.getOrgStructureTreeApproval(this.detailCustomer['CustomerId']).subscribe(
			res => {
				if (res.Data.length > 0) {
					this.originOrg = [];
					_.map(res.Data, val => {
						let obj = {
							OrgId: val.Id,
							OrgName: val.OrgName,
							CostCenterId: val.CostCenterId,
							orgPic: val.organization_approver[0],
							loading: true
						};
						this.organizationId = val.Id;
						this.originOrg.push(obj);
					});
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.getOrgStructureTreeApproval();
					});
				}
				if (err.name == 'TimeoutError') {
					this.getOrgStructureTreeApproval();
				}
			}
		);
	}

	private pics = [];
	private originUser = [];
	private arrPics = [];
	fetchOrganizationPic(idOrg) {
		this.originUser = [];
		this.pics = [];
		this.cmService.getOrganizationByPic(idOrg).subscribe(
			res => {
				this.arrPics = [];
				if (res.Data.length) {
					_.map(res.Data, x => {
						let obj = {
							label: x.FirstName + ' ' + x.LastName,
							value: x.Id
						};
						this.arrPics.push(obj);
						this.pics.push(x.EmailCorp);
					});

					this.originUser.push.apply(this.originUser, res.Data);
				}
				_.map(this.originApproverPic, val => {
					val['arrPics'] = this.arrPics;
				});
				_.map(this.originOrg, x => {
					let getOrganizationPic = _.find(this.originOrg, { OrgId: idOrg });
					getOrganizationPic['arrPics'] = this.arrPics;
					getOrganizationPic['loading'] = false;
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchOrganizationPic(idOrg);
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchOrganizationPic(idOrg);
				}
			}
		);
	}

	// Fetch Cost Center
	// =============================== //
	private dataCostCenter = [];
	private originCostCenter = [];
	fetchCostCenter() {
		this.cmService.getCostCenter(this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.originCostCenter = [];
				this.dataCostCenter = res.Data;
				if (res.Data.length > 0) {
					_.map(res.Data, cost => {
						let obj = {
							CostCenterId: cost.Id,
							CostCenterName: cost.CostCenterName,
							loading: true
						};
						this.originCostCenter.push(obj);
					});
					if (this.selectedApprovalSchema == 'MAS0002') {
						setTimeout(() => {
							_.map(this.originCostCenter, x => {
								let setPic = _.find(this.originApproverPic, {
									CostCenterId: x.CostCenterId
								}).selectedPic;
								x['loading'] = false;
								x['costPic'] = setPic;
							});
						}, 300);
					}
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostCenter();
					});
				}
				if (err.name == 'TimeoutError') {
					this.fetchCostCenter();
				}
			}
		);
	}
	// auto complete direct approval 06-12-19
	// ================================ //
	public emailAutocomplete: any[] = [];
	public filterpicsDirect: any[] = [];
	public filterpicsOrg: any[] = [];
	private originUserAutocomplete: any[] = [];
	searchPics(e) {
		let query = e.query;
		this.emailAutocomplete = [];
		if (this.selectedApprovalSchema == 'MAS0001') {
			this.userManagemenetService
				.getAccountByCustomerAutocomplete(
					this.detailCustomer['CustomerId'],
					query.toLowerCase() + `&OrganizationId=${this.organizationId}`
				)
				.subscribe(res => {
					this.filterpicsOrg = [];
					_.map(res.Data, prop => {
						let obj = {
							UserId: prop.Id,
							Email: prop.EmailCorp
						};
						this.originUserAutocomplete.push(obj);
						this.emailAutocomplete.push(prop.EmailCorp);
						this.filterpicsOrg = this.emailAutocomplete;
					});
				});
		} else {
			this.userManagemenetService
				.getAccountByCustomerAutocomplete(this.detailCustomer['CustomerId'], query.toLowerCase())
				.subscribe(res => {
					this.filterpicsDirect = [];
					_.map(res.Data, prop => {
						let obj = {
							UserId: prop.Id,
							Email: prop.EmailCorp
						};
						this.originUserAutocomplete.push(obj);
						this.emailAutocomplete.push(prop.EmailCorp);
						this.filterpicsDirect.push(obj);
					});
				});
		}
	}

	// Validation limit PIC base on level
	// =============================== //
	validationLimit(CostId) {
		let findCostId = _.find(this.originCostCenter, { CostCenterId: CostId });
		if (findCostId.costPic.length > this.selectedApprovalLevel) {
			let limitCostPic = _.filter(findCostId.costPic, (val, i) => {
				return i < this.selectedApprovalLevel;
			});
			findCostId['costPic'] = limitCostPic;
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Error',
				detail: `Limited Base On Level Is ${this.selectedApprovalLevel}`
			});
		}
	}

	private tmpOrgPic = [];

	convertEmailToId() {
		this.tmpOrgPic = [];
		let approvalUser = [];
		let objSetOrgPic;
		if (this.selectedApprovalSchema == 'MAS0001') {
			_.map(this.originOrg, val => {
				objSetOrgPic = {
					OrganizationId: val.OrgId,
					CostCenter: null,
					Approver: [{ UserId: val.orgPic.UserId, Email: val.orgPic.Email }]
				};
				this.tmpOrgPic.push(objSetOrgPic);
				this.objScheme['ApprovalDirectTypeId'] = '';
			});
		} else {
			_.map(this.originCostCenter, val => {
				objSetOrgPic = {
					OrganizationId: null,
					CostCenter: val.CostCenterId,
					Approver: val.costPic
				};
				this.tmpOrgPic.push(objSetOrgPic);
			});
		}
	}
	// =============================== //
	// End direct approval
	// Save Data
	// =============================== //
	public submitButton: boolean = false;
	save() {
		this.disableNext = false;
		this.submitButton = true;
		this.objScheme['ListApprover'] = [];
		this.objScheme['ApprovalSchemaId'] = this.selectedApprovalSchema;
		this.objScheme['ExecutionTypeId'] = this.selectDirectApprovalExecution;
		this.objScheme['Notification'] = this.selectedNotif;
		this.objScheme['ApprovalLevel'] = this.selectedApprovalLevel;
		this.objScheme['ApprovalLimit'] = moment(this.time).format('HH:mm');
		// _.map(this.emplyersLevel, x => {
		// 	this.objScheme['Employer'].push(x.value);
		// });

		this.convertEmailToId();
		this.limitedPicBaseOnLevel();
		if (this.objScheme['ApprovalSchemaId'] == 'MAS0001' || this.objScheme['ApprovalSchemaId'] == 'MAS0002') {
			this.objScheme['ListApprover'] = this.tmpOrgPic;
		} else {
			this.objScheme['ListApprover'] = [];
			this.objScheme['ApprovalLimit'] = '';
			this.objScheme['ExecutionTypeId'] = '';
			this.objScheme['ApprovalLevel'] = '';
		}
		setTimeout(() => {
			if (!this.checkStatusLimit) {
				if (this.ApprovalId == null) {
					this.cmService.postApproval(this.objScheme).subscribe(
						res => {
							this.submitButton = false;
							this.isNull = false;
							this.msgs = [];
							this.detailCustomer.updateConfigStep('3');
							this.msgs.push({
								severity: 'success',
								summary: 'Success',
								detail: 'Success Approval notif'
							});
							setTimeout(() => {
								this.onSave.emit();
								this.fetchDetailCustomer();
								this.fetchNotifByCustomer();
								this.fetchApproverCostCenter();
								this.getOrgStructureTreeApproval();
							}, 500);
						},
						err => {
							if (err.status == 401) {
								this.mainService.updateToken(() => {
									this.save();
								});
							}
							this.submitButton = false;
							this.msgs = [];
							this.msgs.push({
								severity: 'error',
								summary: 'Error',
								detail: 'Error Approval notif'
							});
						}
					);
				} else {
					this.cmService.updateApproval(this.objScheme, this.ApprovalId).subscribe(
						res => {
							this.submitButton = false;
							this.msgs = [];
							this.detailCustomer.updateConfigStep('3');
							this.msgs.push({
								severity: 'success',
								summary: 'Success',
								detail: 'Success Update Approval notif'
							});
							setTimeout(() => {
								this.onSave.emit();
								this.fetchDetailCustomer();
								this.fetchNotifByCustomer();
								this.fetchApproverCostCenter();
								this.getOrgStructureTreeApproval();
							}, 500);
						},
						err => {
							if (err.status == 401) {
								this.mainService.updateToken(() => {
									this.save();
								});
							}
							this.submitButton = false;
							this.msgs = [];
							this.msgs.push({
								severity: 'error',
								summary: 'Error',
								detail: 'Error Update Approval notif'
							});
						}
					);
				}
			} else {
				this.submitButton = false;
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: `Limited Base On Level Is ${this.selectedApprovalLevel}`
				});
			}
		}, 300);
	}
	// Fetch Approval Schema
	// =============================== //
	private approvalSchema: SelectItem[] = [];
	private selectedApprovalSchema;
	fetchDataApprovalScheme() {
		this.cmService.getApprovalScheme().subscribe(
			res => {
				this.approvalSchema = [];
				this.loading = false;
				_.map(res.Data, x => {
					let obj = {
						label: x.MsApprovalSchemaName,
						value: x.MsApprovalSchemaId
					};
					this.approvalSchema.push(obj);
				});
				this.selectedApprovalSchema = this.approvalSchema[0].value;
				this.objScheme['ApprovalSchemaId'] = this.selectedApprovalSchema;
				this.fetchDataApprovalType();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDataApprovalScheme();
					});
				}
			}
		);
	}
	// Fetch Approval Execution
	// =============================== //
	private directApprovalExecution: SelectItem[] = [];
	private selectDirectApprovalExecution;
	fetchDataApprovalExecution() {
		this.cmService.getExecutionType().subscribe(
			res => {
				this.directApprovalExecution = [];
				_.map(res.Data, x => {
					let obj = {
						label: x.MsExecutionName,
						value: x.MsExecutionTypeId
					};
					this.directApprovalExecution.push(obj);
				});
				this.selectDirectApprovalExecution = this.directApprovalExecution[0].value;
				this.objScheme['ExecutionTypeId'] = $.trim(this.selectDirectApprovalExecution);
				this.fetchEmployer();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDataApprovalExecution();
					});
				}
			}
		);
	}
	onChangeAppovalExecution(e) {
		this.objScheme['ExecutionTypeId'] = $.trim(this.selectDirectApprovalExecution);
	}
	// Approval Level
	// =============================== //
	private approvalLevel: SelectItem[] = [
		{ label: '0', value: 0 },
		{ label: '1', value: 1 },
		{ label: '2', value: 2 },
		{ label: '3', value: 3 }
	];
	private approvalLevelFilter = _.filter(this.approvalLevel, x => {
		return x.value != 0;
	});
	private selectedApprovalLevel = 1;

	onChangeSchema(e) {
		this.objScheme['ApprovalSchemaId'] = this.selectedApprovalSchema;
		if (this.selectedApprovalSchema == 'MAS0002') {
			if (this.selectDirectApprovalType == '') {
				this.selectDirectApprovalType = this.directApprovalType[0].value;
			}
			if (this.emplyersLevel.length == 0) {
				this.onChangeAppovalLevel();
			}
			this.fetchCostCenter();
		}
		this.fetchApproverCostCenter();
		this.getOrgStructureTreeApproval();
		this.onChangeAppovalLevel();
	}

	// Approval Type
	// =============================== //
	private directApprovalType: SelectItem[] = [];
	private selectDirectApprovalType;
	fetchDataApprovalType() {
		this.cmService.getApprovalDirect().subscribe(
			res => {
				this.directApprovalType = [];
				_.map(res.Data, x => {
					let obj = {
						label: x.MsApprovalDirectTypeName,
						value: x.MsApprovalDirectTypeId
					};
					this.directApprovalType.push(obj);
				});
				this.selectDirectApprovalType = this.directApprovalType[0].value;
				this.objScheme['ApprovalDirectTypeId'] = $.trim(this.selectDirectApprovalType);
				this.fetchDataApprovalExecution();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDataApprovalType();
					});
				}
			}
		);
	}
	onChangeAppovalType(e) {
		this.objScheme['ApprovalDirectTypeId'] = this.selectDirectApprovalType;
	}

	// Employres & Approval Level
	// =============================== //
	private employers: SelectItem[] = [];
	fetchEmployer() {
		//yang bikin lemot
		this.fetchNotification();
		// this.userManagemenetService.getAccountByCustomer(this.detailCustomer['CustomerId']).subscribe(
		// 	res => {
		// 		let dataLength = res.Data.length;
		// 		this.employers = [];
		// 		if (dataLength > 0) {
		// 			_.map(res.Data, x => {
		// 				let obj = { label: x.FirstName + ' ' + x.LastName, value: x.Id };
		// 				this.employers.push(obj);
		// 			});
		// 			this.emplyersLevel = [{ value: this.employers[0].value }];
		// 		}
		// 		switch (dataLength) {
		// 			case 1:
		// 				this.approvalLevelFilter = _.filter(this.approvalLevel, x => {
		// 					return x.value <= 1 && x.value != 0;
		// 				});
		// 				break;
		// 			case 2:
		// 				this.approvalLevelFilter = _.filter(this.approvalLevel, x => {
		// 					return x.value <= 2 && x.value != 0;
		// 				});
		// 				break;
		// 		}
		// 		console.log(this.approvalLevelFilter);
		// 	},
		// 	err => {
		// 		if (err.status == 401) {
		// 			this.mainService.updateToken(() => {
		// 				this.fetchEmployer();
		// 			});
		// 		}
		// 	}
		// );
	}
	onChangeAppovalLevel() {
		this.limitedPicBaseOnLevel();
		this.emplyersLevel = [];
		this.disableMultiSelect = false;
		let level = this.selectedApprovalLevel;
		if (this.employers.length > 0) {
			for (let i = 0; i < level; i++) {
				this.emplyersLevel.push({ value: this.employers[i].value });
			}
		}
		this.objScheme['ApprovalLevel'] = this.selectedApprovalLevel;
	}

	private checkStatusLimit: Boolean = false;
	limitedPicBaseOnLevel() {
		if (this.selectedApprovalSchema == 'MAS0002') {
			this.checkStatusLimit = false;
			_.map(this.originCostCenter, val => {
				if (val.costPic != undefined) {
					if (val.costPic.length > this.selectedApprovalLevel) {
						this.checkStatusLimit = true;
					}
				}
			});
		}
	}

	// Approval Limit Time
	// =============================== //
	private time = new Date('2018-08-16T00:00:00.000Z');
	selectedTime(e) {
		this.objScheme['ApprovalLimit'] = moment(this.time).format('HH:mm');
	}
}
