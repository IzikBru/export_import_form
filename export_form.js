class FormElement {
	selector=''
	tagName=''
	tagType=''
	values
}
class SelectListSingle {
	value;
	text;
}
class SelectListMultiple {
	value;
	text;
	selected;
}

/**
 * recursive function to get the html selector of an element.
 * @param {Element} element - html dom element
 * @returns {selector} - the html selector of the given element
 */
function getSelector(element) {
	if (!element) {
	  return '';
	}
  
	let selector = '';
	if (element.tagName.toLowerCase() === 'html') {
	  selector = 'html';
	} else {
	  const parent = element.parentNode;
	  if (parent) {
		const index = Array.from(parent.children).indexOf(element) + 1;
		selector = getSelector(parent) + ' > ' + element.tagName.toLowerCase() + ':nth-child(' + index + ')';
	  }
	}
  
	return selector;
  }
  
  
/**
 * get the value of a dom element, considering it's tagName and tagType
 * @param {Element} dom - html dom element
 * @returns {any} - value - value of the dom element, can be string in case of text, or other formats
 */
function getElementValue(dom) {
	let val = null;
	switch (dom.tagName.toLowerCase()) {
		case 'textarea':
			val = dom.value;
			break;

		case 'select':
			if (dom.multiple) {
				val = [];
				for (let j = 0; j < dom.options.length; j++) {
					multiSelectRecord = new SelectListMultiple();
					multiSelectRecord.value = dom.options[j].value;
					multiSelectRecord.text = dom.options[j].textContent;
					multiSelectRecord.selected = dom.options[j].selected;
					val.push(multiSelectRecord);
				}
			}
			else {
				val = new SelectListSingle();
				val.value = dom.value;
				val.text = dom.options[dom.selectedIndex].text;
			}
			break;
	
		case 'input':
			if (dom.type === 'radio') {
				if (dom.checked === true) {
					val = true;
				} else {
					val = false;
				}
			}
			else {
				val = dom.value;
			}
			break;

		default:
			if (dom.hasAttribute('contenteditable')) {
				val = dom.textContent;
			} else {
				val = '';
			}
	}

	return val;
}


/**
 * find all dom elements under 'form' that are editable by the user, and return them as an array of FormElement
 * @param {Element} form - form dom
 * @returns {[]} - array of FormElement where each element contains dom data
 */
function GetFormElements(form) {
	const formDoms = form.querySelectorAll('select, textarea, [contenteditable="true"], ' +
			'input:not([type="button"],[type="file"],[type="image"],[type="reset"],[type="hidden"],[type="search"])');

	const fElements = [];

	formDoms.forEach(formDom => {
		let fElement = new FormElement();
		// if the dom is "input" or "select" then also set the "tagType" field
		fElement.tagName = formDom.tagName.toLowerCase();
		if (fElement.tagName === 'input') {
			fElement.tagType = formDom.type.toLowerCase();
		}
		else if (fElement.tagName === 'select' && formDom.multiple) {
			fElement.tagType = 'multiple';
		}
		fElement.values = getElementValue(formDom);
		fElement.selector = getSelector(formDom);
		fElements.push(fElement);
	});

	return fElements;
}


/**
 * download hierarchical structure of "FormElement" object as json
 * @param {[]} elementsArray - array comprised of FormElement(s) and nested arrays in hierarchical structure
 * @param {string} file_name - name of the exported filename
 */
function DownloadArrayAsJson(elementsArray, file_name) {
	// convert array, including inner array structure, into Json, with 4 spaces as tab
	const prettyJSON = JSON.stringify(elementsArray, null, 4);
	const dataURI = 'data:text/plain;charset=utf-8,' + encodeURIComponent(prettyJSON);

	// download it as a file 
	const downloadLink = document.createElement('a');
	downloadLink.setAttribute('download', file_name);
	downloadLink.setAttribute('href', dataURI);
	downloadLink.click();
}


function ExportForms(formName='form_export.json') {
	const forms = document.querySelectorAll('form');
	const fElements = []
	forms.forEach(form => {
		fElements.push(...GetFormElements(form));	
	});
	DownloadArrayAsJson(fElements, formName);
}


ExportForms();