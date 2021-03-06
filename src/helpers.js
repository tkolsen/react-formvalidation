import {Children, cloneElement} from 'react'

export function elementHasChildren(element) {
    return element && element.props && element.props.children;
}

const inputTypes = [
    "date",
    "datetime-local",
    "email",
    "month",
    "number",
    "password",
    "search",
    "tel",
    "text",
    "time",
    "url",
    "week",
    "radio",
    "checkbox",
    "color"
];

const tagTypes = [
    "textarea",
    "select"
];

function mapChildrenToFieldIds(children){
    let fieldIdsArray =[];
    Children.forEach(children, child => {
        if(!child || !child.props) return;
        if (inputTypes.includes(child.props.type) || tagTypes.includes(child.type)) {
            if(!child.props.name){
                console.error("Input element is missing name prop. All input elements in form must have name prop set.", child);
                return;
            }
            if(fieldIdsArray.includes(child.props.name)) return;
            fieldIdsArray.push(child.props.name);
        } else if (elementHasChildren(child)) {
            fieldIdsArray.push(...mapChildrenToFieldIds(child.props.children));
        }
    });
    return fieldIdsArray;
}

export function generateInitialState(children) {
    const inputFields = mapChildrenToFieldIds(children);
    const fields = inputFields.reduce((result, fieldId) => {
        result[fieldId] = {
            errorMessage: false,
            valid: true
        };
        return result
    }, {});

    return {fields}
}

export function addCustomValidation(fieldId, field, customValidation) {
    return new Promise((resolve) => {
        if (customValidation[fieldId]) {
            customValidation[fieldId](field.value)
                .then(errorMessage => {
                    field.setCustomValidity(errorMessage);
                    resolve(field);
                })
        } else {
            resolve(field);
        }
    });
}
