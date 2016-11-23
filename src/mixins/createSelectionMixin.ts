import { ComposeMixinDescriptor } from 'dojo-compose/compose';
import { emit } from 'dojo-core/on';
import delegate from 'dojo-dom/delegate';
import { h, VNode } from 'maquette';
import Dgrid from '../Dgrid';

export type TextSelectionType = 'always' | 'never' | 'selectionModeNone';

export interface Selection {
	_allowTextSelection: TextSelectionType;
	_lastSelected: HTMLElement;
	_selectionEventQueues: {
		deselect: string[];
		select: string[];
	};
	_selectionHandlerName: string;
	_selectionMode: string;

	/**
	 * Indicates the property added to emitted events for selected targets; overridden in CellSelection
	 */
	_selectionTargetType: string;

	_selectionTriggerEvent: UIEvent;
	_waitForMouseUp: HTMLElement;
	allSelected: boolean;
	selection: {
		[key: string]: boolean;
	};
	selectionMode: string;
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

			get allowTextSelection(): TextSelectionType {
				return this._allowTextSelection;
			},

			set allowTextSelection(newValue: TextSelectionType) {
				let userSelectValue = 'text';

				if (newValue === 'never' ||
					(newValue === 'selectionModeNone' && this.selectionMode !== 'none')) {
					userSelectValue = 'none';
				}

				this._allowTextSelection = newValue;
				// TODO: if all supported browsers don't support CSS user-select, add workarounds from dgrid 1
				this.domNode.querySelector('.dgrid-scroller').style.userSelect = userSelectValue;
			},

			/**
			 * Deselects any currently-selected items.
			 *
			 * @param [exceptId] If specified, the given id will not be deselected.
			 * @param [dontResetLastSelected] If true, `this._lastSelected` will not be cleared
			 */
			clearSelection(exceptId?: string, dontResetLastSelected?: boolean) {
				this.allSelected = false;

				for (let id in this.selection) {
					if (exceptId !== id) {
						this._select(this.row(id), null, false);
					}
				}

				if (!dontResetLastSelected) {
					this._lastSelected = null;
				}

				this._fireSelectionEvents();
			},

			/**
			 * Returns true if the indicated row is selected.
			 */
			isSelected(row: HTMLElement): boolean {
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

			/**
			 * Selects or deselects the given row or range of rows.
			 *
			 * @param startingRow Row object (or something that can resolve to one) to (de)select
			 * @param [endingRow] If specified, the inclusive range between `startingRow` and `endingRow` will
			 * 		be (de)selected
			 * @param [isSelected] Whether to select (true/default), deselect (false), or toggle (null) the row
			 */
			select(startingRow: HTMLElement, endingRow?: HTMLElement, isSelected?: boolean) {
				this._select(startingRow, endingRow, isSelected);
				this._fireSelectionEvents();
			},

			selectAll() {
				this.allSelected = true;
				this.selection = {};

				for (let i = 0; i < this.props.collection.length; i++) {
					// FIXME: this needs to get the row object's id
					const row = this.row(this.props.collection[i]);
					this._select(row, null, true);
				}

				this._fireSelectionEvents();
			},

			/**
			 * Deselects the given row or range of rows.
			 *
			 * @param startingRow Row object (or something that can resolve to one) to deselect
			 * @param [endingRow] If specified, the inclusive range between `startingRow` and `endingRow` will
			 * 		be deselected
			 */
			deselect: function (startingRow: HTMLElement, endingRow?: HTMLElement) {
				this.select(startingRow, endingRow, false);
			},

			get selectionMode(): string {
				return this._selectionMode;
			},

			set selectionMode(mode: string) {
				if (mode === this._selectionMode) {
					return;
				}

				this.clearSelection();
				this._selectionMode = mode;
				this._selectionHandlerName = '_' + mode + 'SelectionHandler';

				// Also re-run allowTextSelection setter in case it is in automatic mode.
				this.allowTextSelection = this._allowTextSelection;
			},

			_fireSelectionEvent(type: string) {
				const eventObject = {
					bubbles: true,
					grid: this,
					type: 'dgrid-' + type
				};

				if (this._selectionTriggerEvent) {
					(<any> eventObject).parentType = this._selectionTriggerEvent.type;
				}

				(<any> eventObject)[this._selectionTargetType] = this._selectionEventQueues[type];
				this._selectionEventQueues[type] = [];
				emit(this, eventObject);
			},

			_fireSelectionEvents() {
				for (let type in this._selectionEventQueues) {
					if (this._selectionEventQueues[type].length) {
						this._fireSelectionEvent(type);
					}
				}
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
					if (!(<KeyboardEvent> event).shiftKey && event.type === downType && this.isSelected(row)) {
						this._waitForMouseUp = target;
					}
					else {
						this[this._selectionHandlerName](event, row);
					}
				}

				this._selectionTriggerEvent = null;
			},

			_select(startingRow: HTMLElement, endingRow?: HTMLElement, isSelected: boolean = true) {
				const rowId = this.scaffolding.identify((<any> startingRow).dgridData);

				// Check whether we're allowed to select the given row before proceeding.
				// If a deselect operation is being performed, this check is skipped,
				// to avoid errors when changing column definitions, and since disabled
				// rows shouldn't ever be selected anyway.
				if (isSelected === false || this.allowSelect(startingRow)) {
					const previousValue = !!this.selection[rowId];

					if (isSelected === null) {
						isSelected = !previousValue;
					}

					if (!isSelected && !this.allSelected) {
						delete this.selection[rowId];
					}
					else {
						this.selection[rowId] = isSelected;
					}

					if (isSelected) {
						startingRow.classList.add('dgrid-selected');
					}
					else {
						startingRow.classList.remove('dgrid-selected');
					}

					if (isSelected !== previousValue) {
						if (isSelected) {
							this._selectionEventQueues.select.push(startingRow);
						}
						else {
							this._selectionEventQueues.deselect.push(startingRow);
						}
					}
				}
			},

			/**
			 * Selection handler for "single" mode, where only one target may be selected at a time.
			 */
			_singleSelectionHandler(event: UIEvent, target: HTMLElement) {
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
			},

			/**
			 * Selection handler for "multiple" mode, where shift can be held to select ranges, ctrl/cmd can be
			 * held to toggle, and clicks/keystrokes without modifier keys will add to the current selection.
			 */
			_multipleSelectionHandler(event: UIEvent, target: HTMLElement) {
				const ctrlKey = (<KeyboardEvent> event).keyCode ? (<KeyboardEvent> event).ctrlKey : (<any> event)[ctrlEquiv];

				let lastRow = this._lastSelected;
				let isSelected: boolean;

				if (!(<KeyboardEvent> event).shiftKey) {
					// Toggle if ctrl is held; otherwise select
					isSelected = ctrlKey ? null : true;
					lastRow = null;
				}

				this.select(target, lastRow, isSelected);

				if (!lastRow) {
					// Update reference for potential subsequent shift+select
					// (current row was already selected above)
					this._lastSelected = target;
				}
			},

			/**
			 * Selection handler for "extended" mode, which is like multiple mode except that clicks/keystrokes
			 * without modifier keys will clear the previous selection.
			 */
			_extendedSelectionHandler(event: UIEvent, target: HTMLElement) {
				// Clear selection first for right-clicks outside selection and non-ctrl-clicks;
				// otherwise, extended mode logic is identical to multiple mode
				if ((<MouseEvent> event).button === /* secondary/right button */ 2) {
					if (!this.isSelected(target)) {
						this.clearSelection(null, true);
					}
				}
				else if ((<KeyboardEvent> event).keyCode &&
					!(<MouseEvent> event).ctrlKey) {
					this.clearSelection(null, true);
				}
				else if (!(<any> event)[ctrlEquiv]) {
					this.clearSelection(null, true);
				}

				this._multipleSelectionHandler(event, target);
			},

			/**
			 * Selection handler for "toggle" mode which simply toggles the selection of the given target.
			 * Primarily useful for touch input.
			 */
			_toggleSelectionHandler(event: UIEvent, target: HTMLElement) {
				this.select(target, null, null);
			}
		},

		initialize(grid: SelectionGrid, options: any) {
			grid._allowTextSelection = 'selectionModeNone';
			grid.selection = {};
			grid.selectionMode = options.selectionMode || 'none';
			grid._selectionEventQueues = {
				deselect: [],
				select: []
			};
			grid._selectionTargetType = 'rows';
		},

		aspectAdvice: {
			after: {
				startup() {
					delegate(this.domNode, '.dgrid-row', 'click', (event: UIEvent) => {
						this._handleSelect(event, event.target);
					});
				}
			}
		}
	};
};

export default createSelectionMixin;
