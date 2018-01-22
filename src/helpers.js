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

export function generateInitialState(children) {
    const inputFields = Children.map(children, child => {
        if (inputTypes.includes(child.props.type) || tagTypes.includes(child.type)) {
            return cloneElement(child, child.props);
        } else if (elementHasChildren(child)) {
            return cloneElement(child, {}, generateInitialState(child.children))
        }
    });


    const fields = inputFields.reduce((result, field) => {
        result[field.props.id] = {
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
