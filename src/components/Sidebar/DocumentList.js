import {
	createDocument,
	deleteDocument,
	getRootDocuments,
} from '../../utils/api/apis.js';
import { createElement } from '../../utils/createElement.js';
import { push } from '../../utils/router.js';
import {
	getItem,
	OPENED_DOCUMENT_ITEMS,
	setItem,
} from '../../utils/storage.js';
import templates from '../../utils/templates.js';

/**
 * state: array
 */
export default function DocumentList({ $target, initialState = [] }) {
	const $documentList = createElement({
		element: 'div',
		$target,
		className: 'document-list__root',
	});

	this.state = initialState;

	this.setState = (nextState) => {
		this.state = nextState;
		this.render();
	};

	this.render = () => {
		const openedDocumentItems = getItem(OPENED_DOCUMENT_ITEMS, []);
		$documentList.innerHTML = `
			${this.state
				.map(
					({ id, title, documents: subDocumentList }) => `
				${templates.rootDocumentListItem(
					id,
					title,
					subDocumentList,
					openedDocumentItems
				)}
			`
				)
				.join('')}
		`;
	};

	this.render();

	$documentList.addEventListener('click', async (event) => {
		event.stopPropagation();
		const { target } = event;
		const { action } = target.dataset;
		const { id, currentPath } = target.closest('div').dataset;

		if (action) {
			const storedOpenedDocumentsItems = getItem(OPENED_DOCUMENT_ITEMS, []);

			switch (action) {
				case 'toggle':
					if (storedOpenedDocumentsItems.includes(id)) {
						const removedOpenedDocumentItemIndex =
							storedOpenedDocumentsItems.findIndex(
								(openedDocumentItemId) => openedDocumentItemId === id
							);

						if (removedOpenedDocumentItemIndex !== -1)
							storedOpenedDocumentsItems.splice(
								removedOpenedDocumentItemIndex,
								1
							);
						setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems]);
					} else {
						setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems, id]);
					}
					this.setState([...this.state]);
					break;
				case 'delete':
					// todo : 만약 현재 작성 중인 페이지를 없애려고 한다면 home으로 돌아가게 만들자. -> good
					const [, currentId] = window.location.pathname.split('/');

					const removedOpenedDocumentItemIndex =
						storedOpenedDocumentsItems.findIndex(
							(openedDocumentItemId) => openedDocumentItemId === id
						);
					if (removedOpenedDocumentItemIndex !== -1)
						storedOpenedDocumentsItems.splice(
							removedOpenedDocumentItemIndex,
							1
						);
					setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems]);
					await deleteDocument(id);
					const nextRootDocumentsAfterDeleteAction = await getRootDocuments();
					this.setState(nextRootDocumentsAfterDeleteAction);
					if (id === currentId) push('/');
					break;
				case 'add':
					// todo : 새로 생성된 문서로 바로 작성하러 갈 수 있도록 추가해줄까?
					if (!storedOpenedDocumentsItems.includes(id))
						setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems, id]);
					await createDocument({ parent: id });
					const nextRootDocumentsAfterCreateAction = await getRootDocuments();
					this.setState(nextRootDocumentsAfterCreateAction);
					break;
			}
		}

		// todo : 현재 클릭한 것은 background-color를 바꾸는 등 focus 되도록 하자.
		if (!action && id) push(`${id}?currentPath=${currentPath}`);
	});
}
