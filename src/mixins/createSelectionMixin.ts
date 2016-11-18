import { ComposeMixinDescriptor } from 'dojo-compose/compose';
import delegate from 'dojo-dom/delegate';
import { h, VNode } from 'maquette';
import Dgrid from '../Dgrid';

export interface Selection {
	_lastSelected: HTMLElement;
	_selectionHandlerName: string;
	_selectionTriggerEvent: UIEvent;
	_waitForMouseUp: HTMLElement;
	allSelected: boolean;
	selection: {
		[key: string]: boolean;
	};

	_fireSelectionEvents(): void;
	_handleSelect(event: UIEvent, target: HTMLElement): void;
	_select(startingRow: HTMLElement, endingRow?: HTMLElement, isSelected?: boolean): void;
	allowSelect(element: HTMLElement): boolean;
}

export type SelectionGrid = Selection & Dgrid;

// TODO: complete implementation
const ctrlEquiv = 'ctrlKey';
const downType = 'mousedown';
const upType = 'mouseup';

function createSelectionMixin<T, O, U, P>(): ComposeMixinDescriptor<any, any, any, any> {
	return {
		mixin: {
			allowSelect() {
				return true;
			},

			clearSelection(exceptId?: string, dontResetLastSelected?: boolean) {
				// summary:
				// 		Deselects any currently-selected items.
				// exceptId: Mixed?
				// 		If specified, the given id will not be deselected.

				this.allSelected = false;

				for (let id in this.selection) {
					if (exceptId !== id) {
						this._select(id, null, false);
					}
				}
				if (!dontResetLastSelected) {
					this._lastSelected = null;
				}
				this._fireSelectionEvents();
			},

			isSelected(row: HTMLElement): boolean {
				// summary:
				// 		Returns true if the indicated row is selected.

				if (row == null) {
					return false;
				}

				let isSelected = false;

				if (!(<any> row).dgridData) {
					row = this.row(row);
				}

				let rowId = (<any> row).dgridData[this.idProperty];

				// First check whether the given row is indicated in the selection hash;
				// failing that, check if allSelected is true (testing against the
				// allowSelect method if possible)
				if (rowId in this.selection) {
					isSelected = !!this.selection[rowId];
				}
				else if (this.allSelected) {
					isSelected = this.allowSelect(row);
				}

				return isSelected;
			},

			select() {

			},

			_handleSelect(event: UIEvent, target: HTMLElement) {
				const row = this.row(target);

				// Don't run if selection mode doesn't have a handler (incl. "none"), target can't be selected,
				// or if coming from a dgrid-cellfocusin from a mousedown
				if (!this[this._selectionHandlerName] || !this.allowSelect(row) ||
						(event.type === 'dgrid-cellfocusin' && (<any> event).parentType === 'mousedown') ||
						(event.type === upType && target !== this._waitForMouseUp)) {
					return;
				}
				this._waitForMouseUp = null;
				this._selectionTriggerEvent = event;

				// Don't call select handler for ctrl+navigation
				if (!(<KeyboardEvent> event).keyCode || !(<KeyboardEvent> event).ctrlKey || (<KeyboardEvent> event).keyCode === 32) {
					// If clicking a selected item, wait for mouseup so that drag n' drop
					// is possible without losing our selection
					if (!(<KeyboardEvent> event).shiftKey && event.type === downType && this.isSelected(target)) {
						this._waitForMouseUp = target;
					}
					else {
						this[this._selectionHandlerName](event, target);
					}
				}

				this._selectionTriggerEvent = null;
			},

			_singleSelectionHandler(event: UIEvent, target: HTMLElement) {
				// summary:
				// 		Selection handler for "single" mode, where only one target may be
				// 		selected at a time.

				const ctrlKey = (<KeyboardEvent> event).keyCode ? (<KeyboardEvent> event).ctrlKey : (<any> event)[ctrlEquiv];

				if (this._lastSelected === target) {
					// Allow ctrl to toggle selection, even within single select mode.
					this.select(target, null, !ctrlKey || !this.isSelected(target));
				}
				else {
					this.clearSelection();
					this.select(target);
					this._lastSelected = target;
				}
			}
		},
		initialize(instance: SelectionGrid, options: any) {
			instance._selectionHandlerName = 'none';
		},
		aspectAdvice: {
			after: {
				startup() {
					delegate(this.domNode, '.dgrid-row', 'click', function (event: UIEvent) {
						this._handleSelect(event, this);
					});
				}
			}
		}
	};
};

export default createSelectionMixin;
