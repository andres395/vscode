/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/modalDialog';
import { IInstantiationService, createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ThemeIcon } from 'vs/base/common/themables';
import { InstantiationType, registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { Dialog } from 'vs/base/browser/ui/dialog/dialog';
import { defaultButtonStyles, defaultCheckboxStyles, defaultDialogStyles, defaultInputBoxStyles } from 'vs/platform/theme/browser/defaultStyles';
import { $ } from 'vs/base/browser/dom';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { ILinkDescriptor, Link } from 'vs/platform/opener/browser/link';

export interface IModalDialogItem {
	readonly title: string;
	readonly mainMessage: { message: string; icon: ThemeIcon };
	readonly secondaryMessage: { message: string; icon: ThemeIcon };
	readonly buttonText: string;
	readonly action?: ILinkDescriptor;
	readonly onClose?: () => void;
}

export const IModalDialogService = createDecorator<IModalDialogService>('modalDialogService');

export interface IModalDialogService {
	readonly _serviceBrand: undefined;

	show(item: IModalDialogItem): void;
}

export class ModalDialogService implements IModalDialogService {
	declare readonly _serviceBrand: undefined;

	private dialog: Dialog | undefined;
	private disposableStore: DisposableStore = new DisposableStore();

	constructor(
		@ILayoutService private readonly layoutService: ILayoutService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,) {
	}

	private static iconWidgetFor(icon: ThemeIcon) {
		if (icon) {
			const widget = $(ThemeIcon.asCSSSelector(icon));
			widget.classList.add('icon-widget');
			return widget;
		}
		return '';
	}

	async show(modalDialogItem: IModalDialogItem): Promise<void> {

		this.disposableStore.clear();

		const renderBody = (parent: HTMLElement) => {

			parent.classList.add(...('modal-dialog-items'));
			const mainDescriptorComponent =
				$('.modal-dialog-mainmessage',
					{},
					ModalDialogService.iconWidgetFor(modalDialogItem.mainMessage.icon),
					$('.description-container', {},
						$('.description.description.max-lines-3', { 'x-description-for': 'description' }, ...renderLabelWithIcons(modalDialogItem.mainMessage.message))));
			parent.appendChild(mainDescriptorComponent);

			const secondaryDescriptorComponent =
				$('.modal-dialog-secondaryMessage',
					{},
					ModalDialogService.iconWidgetFor(modalDialogItem.secondaryMessage.icon),
					$('.description-container', {},
						$('.description.description.max-lines-3', { 'x-description-for': 'description' }, ...renderLabelWithIcons(modalDialogItem.secondaryMessage.message))));

			parent.appendChild(secondaryDescriptorComponent);

			const actionsContainer = $('div.modal-dialog-action-container');
			parent.appendChild(actionsContainer);
			if (modalDialogItem.action) {
				this.disposableStore.add(this.instantiationService.createInstance(Link, actionsContainer, modalDialogItem.action, {}));
			}
		};

		this.dialog = new Dialog(
			this.layoutService.container,
			modalDialogItem.title,
			[modalDialogItem.buttonText],
			{
				detail: '',
				type: 'none',
				renderBody: renderBody,
				buttonStyles: defaultButtonStyles,
				checkboxStyles: defaultCheckboxStyles,
				inputBoxStyles: defaultInputBoxStyles,
				dialogStyles: defaultDialogStyles
			});

		this.disposableStore.add(this.dialog);
		await this.dialog.show();
		this.disposableStore.dispose();
	}
}

registerSingleton(IModalDialogService, ModalDialogService, InstantiationType.Eager);

