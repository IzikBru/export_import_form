/**
 * open json file selection browser, and parse its content into an array of FormElement objects
 * @return {[]} - array comprised of FormElement(s) and nested arrays in hierarchical structure
 */
function readJsonFileAsArray() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    return new Promise((resolve, reject) => {
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];

            const reader = new FileReader();
            reader.onload = function(event) {
                const fileContent = event.target.result;
                const jsonArray = JSON.parse(fileContent);
                resolve(jsonArray);
            };

            reader.readAsText(file);
        });

        input.click();
    });
}


/**
 * update the value of a DOM element according to the selector and value of FormElement object
 * @param {FormElement} elm
 */
function fillElementValues(elm) {
    const dom_elm = document.querySelector(elm.selector)

    switch (elm.tagName) {
        case 'textarea':
            dom_elm.value = elm.values;
            break;
    
        case 'select':
            if (elm.tagType === 'multiple') {
                // clean all previous options
                while (dom_elm.options.length > 0) {
                    dom_elm.remove(0);
                }
                elm.values.forEach(option => {
                    let newOption = document.createElement('option');
                    newOption.value = option.value;
                    newOption.textContent = option.text;
                    newOption.selected = option.selected;
                    dom_elm.appendChild(newOption);
                });
            }
            else {
                dom_elm.value = elm.values.value;
            }
            break;
    
        case 'input':
            if (elm.tagType == 'radio') {
				if (elm.values == true) {
					dom_elm.checked = true;
				} else {
					dom_elm.checked = false;
				}
			}
			else {
				dom_elm.value = elm.values;
			}
            break;
    
        default:
            dom_elm.textContent = elm.values;
    }

    dom_elm.dispatchEvent(new Event('change'));
    
} 

/**
 * import json file and fill the form fields
 */
async function ImportForm() {
    try {
        const fElements = await readJsonFileAsArray();
        fElements.forEach(fElement => {
            try {
                fillElementValues(fElement);
            }
            catch (error) {
                console.log('Error while filling element:' + fElement + '. ' + error);
            }
        });
    } catch (error){
        console.log('Error while importing form. ' + error);
        exit();
    }
    
}

ImportForm();