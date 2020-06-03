import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { TreeNode } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { CustomerManagementService } from '../customer-management.service';
import { MainService } from '../../lib/service/main.service';
import { EligibilityComponent } from '../eligibility/eligibility.component';
import { DetailCustomerComponent } from '../detail-customer/detail-customer.component';

@Component({
	selector: 'app-organization',
	templateUrl: './organization.component.html',
	styleUrls: ['./organization.component.scss'],
	providers: [EligibilityComponent]
})
export class OrganizationComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public dataOrg: TreeNode[];
	public msgs: Message[] = [];
	public isZoom: boolean = false;

	@Input() disableNext: boolean;
	@Output() onSave = new EventEmitter();

	constructor(
		private mainService: MainService,
		private messageService: MessageService,
		private cmService: CustomerManagementService,
		private eligibilityComponent: EligibilityComponent,
		private detailCustomer: DetailCustomerComponent
	) {}

	ngOnInit() {
		this.fetchOrganization();
	}

	// ============================================================================== //
	// Organization Structure
	// ============================================================================== //

	// Next Configuraiton
	// =========================== //
	next() {
		this.onSave.emit();
		this.detailCustomer.updateConfigStep('0');
		this.eligibilityComponent.fetchData();
		this.eligibilityComponent.fetchCategory();
	}
	handleChange(e) {
		if (e.index == 1) {
			this.fetchOrgTree();
		}
	}
	// Fetch Tree
	// =========================== //
	public isNull: boolean = true;
	public loadingOrgTree = false;
	private fetchTree = [];
	private originOrg = [];
	fetchOrgTree() {
		this.loadingOrgTree = true;
		this.cmService.getOrgStructureTree(this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.fetchTree = [];
				this.originOrg = [];
				let data = res.Data;
				if (data.length != 0) {
					_.map(data, x => {
						x.IsParent = x.IsParent == '1';
						x['statusUpdate'] = false;
					});
					this.createOrgTree(data);
					this.originOrg = data;
					this.loadingOrgTree = false;
					this.isNull = false;
				} else {
					this.dataOrg = [
						{
							label: null,
							expanded: true,
							type: 'master',
							data: {
								id: _.uniqueId('CO-000'),
								parent: null,
								costCenter: this.msCostCenter[0].value,
								orgName: null
							},
							children: []
						}
					];
				}

				this.loadingOrgTree = false;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchOrgTree();
					});
				}
			}
		);
	}

	// Create Item Organization Structure
	// =========================== //
	private arrOrgTree = [];
	createOrgTree(data) {
		this.arrOrgTree = [];

		_.map(data, (x, i) => {
			if (x.ParentId == x.Id) {
				x.ParentId = null;
			}
			let type;
			if (i == 0) {
				type = 'master';
			} else {
				type = 'child';
			}

			// Creat Org Structure
			let obj = {
				label: x.OrgStructureId,
				expanded: true,
				type: type,
				data: {
					id: x.Id,
					parent: x.ParentId,
					costCenter: x.CostCenterId,
					orgName: x.OrgName,
					IsParent: x.IsParent
				},
				disabled: false,
				children: []
			};

			if (obj.type == 'master') {
				this.dataOrg = [obj];
			}
			this.arrOrgTree.push(obj);
		});

		this.arrOrgTree[0].data.parent = null;
		this.recursionChildTree(this.dataOrg);
	}
	recursionChildTree(data) {
		_.map(data, x => {
			let filterItem = _.filter(this.arrOrgTree, n => {
				return n.data.parent == x.data.id;
			});
			x.children = filterItem;
			if (x.children.length != 0) {
				_.map(filterItem, n => {
					if (n.data.IsParent) {
						this.recursionChildTree(filterItem);
					}
				});
				x.disabled = true;
			}
		});
	}

	// ============================================================================== //
	// Organization
	// ============================================================================== //
	private selectedOrgStrcuture = null;
	private originMsOrganizationStructure = [];
	private msOrganizationStructure = [];
	private firstObjOrg = null;
	fetchOrganization() {
		this.cmService.getOrganization().subscribe(
			res => {
				this.originMsOrganizationStructure = [];
				this.msOrganizationStructure = [];
				_.map(res.Data, x => {
					let obj = { label: x.OrgStructureName, value: x.Id };
					this.originMsOrganizationStructure.push(obj);

					let objClone = { label: x.OrgStructureName, value: x.Id };
					this.msOrganizationStructure.push(objClone);
				});
				this.fetchCostCenter();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchOrganization();
					});
				}
			}
		);
	}

	// Change Organization Master
	// =========================== //
	changeStructure(e, obj) {
		if (!this.isNull) {
			this.loadingOrgTree = true;
			this.cmService.putOrgOne({ OrgStructureId: obj.label }, obj.data.id).subscribe(
				res => {
					this.fetchOrgTree();
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success update organization Structure'
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.changeCostOrgCenter(e, obj);
						});
					}
				}
			);
		}
	}
	// Change Cost Center
	// ================================ //
	changeCostOrgCenter(e, obj) {
		if (!this.isNull) {
			this.loadingOrgTree = true;
			this.cmService.putOrgOne({ CostCenterId: obj.data.costCenter }, obj.data.id).subscribe(
				res => {
					this.fetchOrgTree();
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success update cost center'
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.changeCostOrgCenter(e, obj);
						});
					}
				}
			);
		}
	}

	// Write Organization Name
	// ================================ //
	private timeout: any;
	saveOrgName(obj) {
		if (!this.isNull) {
			this.loadingOrgTree = true;
			this.cmService.putOrgOne({ OrgName: obj.data.orgName }, obj.data.id).subscribe(
				res => {
					this.fetchOrgTree();
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success update Organization Name'
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.saveOrgName(obj);
						});
					}
				}
			);
		}
	}

	// Add Organization as master
	// =========================== //
	createMaster(e) {
		this.loadingOrgTree = true;
		let isParent = e.data.IsParent ? undefined : false;
		let obj = {
			OrgStructureId: _.find(this.originMsOrganizationStructure, {
				value: e.label
			}).value,
			OrgName: e.data.orgName,
			ParentId: null,
			IsParent: isParent,
			CostCenterId: e.data.costCenter,
			CustomerId: this.detailCustomer['CustomerId']
		};

		this.cmService.postOrgOne(obj).subscribe(
			res => {
				this.fetchOrgTree();
				e.data.id = res.Data[0].Id;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.addOrg(e);
					});
				}
			}
		);
	}
	// Add organization child item
	// =========================== //
	addOrg(e) {
		this.loadingOrgTree = true;
		let obj = {
			OrgStructureId: e.label,
			OrgName: _.find(this.msOrganizationStructure, { value: e.label }).label,
			ParentId: e.data.id,
			IsParent: false,
			CostCenterId: null,
			CustomerId: this.detailCustomer['CustomerId']
		};

		this.cmService.postOrgOne(obj).subscribe(
			res => {
				this.cmService.putOrgOne({ IsParent: true }, e.data.id).subscribe(res => {
					this.fetchOrgTree();
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success add organization'
					});
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.addOrg(e);
					});
				}
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed add organization'
				});
			}
		);
	}

	// Remove Organization
	// =========================== //
	removeOrg(e) {
		this.loadingOrgTree = true;
		if (e.children.length != 0) {
			this.recRemove(e, this.dataOrg);
		} else {
			this.cmService.deleteOrg(e.data.id).subscribe(
				res => {
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Delete organization'
					});
					this.loadingOrgTree = false;
					this.refreshParent(e);
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.removeOrg(e);
						});
					}
					this.loadingOrgTree = false;
					this.msgs = [];
					this.msgs.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed remove organization'
					});
				}
			);
		}
	}
	// Remove Organization Child
	// =========================== //
	private arrRemoveId = [];
	recRemove(obj, arr) {
		this.loadingOrgTree = true;
		this.arrRemoveId = [];
		_.map(arr, x => {
			if (x.data.id == obj.data.parent) {
				let arrParent = x.children;
				if (obj.children.length >= 1) {
					_.map(obj.children, n => {
						this.arrRemoveId.push(n.data.id);
					});
				}
				this.arrRemoveId.push(obj.data.id);
			} else {
				this.recRemove(obj, x.children);
				this.arrRemoveId.push(obj.data.id);
			}
		});

		this.cmService.deleteOrgById(this.arrRemoveId).subscribe(
			res => {
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Delete organization'
				});
				this.refreshParent(obj);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.recRemove(obj, arr);
					});
				}
				this.loadingOrgTree = false;
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed remove organization'
				});
			}
		);
	}

	// Refresh Parent
	refreshParent(obj) {
		this.cmService.getOrgStructureTree(this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.originOrg = res.Data;
				let parent = obj.data.parent;
				let find = _.find(this.originOrg, { ParentId: parent });
				if (find == undefined) {
					this.cmService.putOrgOne({ IsParent: '0' }, parent).subscribe(res => {
						this.fetchOrgTree();
						this.msgs = [];
						this.msgs.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Update parent'
						});
					});
				} else {
					this.fetchOrgTree();
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.refreshParent(obj);
					});
				}

				if (err.name == 'TimeoutError') {
					this.refreshParent(obj);
				}
			}
		);
	}

	// ============================================================================== //
	// Cost Center
	// ============================================================================== //

	// Properties
	// =========================== //
	public inputCostCenter: string;
	public msCostCenter = [];
	public blockCostCenter: boolean = false;
	public disabledBtnCost: boolean = false;

	// Fetch Cost Center
	// =========================== //
	fetchCostCenter() {
		this.blockCostCenter = true;
		let id = this.detailCustomer['CustomerId'];
		this.cmService.getCostCenter(id).subscribe(
			res => {
				this.msCostCenter = [];
				this.blockCostCenter = false;
				_.map(res.Data, x => {
					let obj = { label: x.CostCenterName, value: x.Id };
					this.msCostCenter.push(obj);
				});
				this.msCostCenter.unshift({ label: 'None', value: null });
				this.fetchOrgTree();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostCenter();
					});
				} else {
					this.blockCostCenter = false;
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

	// Add Cost Center
	// =========================== //
	addNewCost() {
		let check = _.find(this.msCostCenter, { label: this.inputCostCenter });
		if (!check) {
			this.disabledBtnCost = true;
			let body = {
				CostCenterName: this.inputCostCenter,
				CustomerId: this.detailCustomer['CustomerId']
			};
			this.blockCostCenter = true;
			this.cmService.postCostCenter(body).subscribe(
				res => {
					this.fetchCostCenter();
					this.inputCostCenter = null;
					this.disabledBtnCost = false;
				},
				err => {
					this.blockCostCenter = false;
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.addNewCost();
						});
					} else {
						this.msgs = [];
						this.disabledBtnCost = false;
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

	// Remove Cost Center
	// =========================== //
	removeCost(e) {
		this.blockCostCenter = true;
		this.cmService.deleteCostCenter(e.value, this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.fetchCostCenter();
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success remove cost center'
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.removeCost(e);
					});
				} else {
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
	//update poolId
	updatePoolId(obj) {
		let body = {
			PoolId: obj.PoolId
		};
		obj.statusUpdate = true;
		this.cmService.updatePoolIdOrganization(body, obj.Id).subscribe(
			res => {
				obj.statusUpdate = false;
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success Update PoolId'
				});
			},
			err => {
				obj.statusUpdate = false;
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.updatePoolId(obj);
					});
				} else {
					obj.statusUpdate = false;
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
