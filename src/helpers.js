import {Children, cloneElement} from 'react'

export function getInitialState(children) {
    let initialState = {
        fields: {}
    };

    Object.keys(fields).forEach(fieldId => {
        initialState.fields[fieldId] = {
            errorMessage: false,
            valid: true
        };
    });

    return initialState;
}

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
]

const tagTypes = [
    "textarea",
    "select"
]

export function generateInitialState(children) {
    console.log("******", children)
    const inputFields = Children.map(children, child => {
        if (inputTypes.includes(child.props.type) || tagTypes.includes(child.type)) {
            return cloneElement(child, child.props);
        } else if (elementHasChildren(child)) {
            return cloneElement(child, {}, generateInitialState(child.children))
        }
    })

    console.log("*****************", inputFields)

    const fields = inputFields.reduce((result, field) => {
        result[field.props.id] = {
            errorMessage: false,
            valid: true
        }
        return result
    }, {})

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


export function addOnBlur(fieldId, field, onBlur) {
    if (onBlur[fieldId]) {
        onBlur[fieldId](field);
    }
}

export function addOnChange(fieldId, field, onChange) {
    if (onChange[fieldId]) {
        onChange[fieldId](field);
    }
}
