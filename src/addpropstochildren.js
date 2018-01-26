import { Children, cloneElement } from "react";
import {elementHasChildren} from "./helpers"


// TODO: Add file


const TEXT_FIELDS = [
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
    "week"
];


function elementIsTextField(element) {
    return TEXT_FIELDS.indexOf(element.props.type) > -1 || element.type === 'textarea';
}

function elementIsRadioField(element) {
    return element.props.type === 'radio';
}

function elementIsCheckboxField(element) {
    return element.props.type === 'checkbox';
}

function elementIsSelectField(element) {
    return element.type === 'select';
}

function elementIsColorField(element) {
    return element.props.type === 'color';
}

function elementIsErrorMessage(element) { 
    return element && element.props && element.props["data-errorfor"];
}

function elementIsInFieldList(element, state) {
    if (element && element.props) {
        const fieldList = Object.keys(state);
        if (fieldList.indexOf(element.props.id) > -1 || fieldList.indexOf(element.props.name) > -1) {
            return true;
        }
    }
    return false;
}

export function addPropsToChildren(children, state, handles) {


    return Children.map(children, child => {
        if (elementIsInFieldList(child, state)) {

            if (elementIsRadioField(child)) {
                const fieldId = child.props.name;

                const props = {
                    defaultChecked: child.props.defaultChecked,
                    onChange: handles.radioChange(child.props.onChange)
                };

                if (child.props.required) {
                    props["aria-invalid"] = !state[fieldId].valid;
                    props["aria-errormessage"] = fieldId + "-errormessage";
                }

                return cloneElement(child, props);
            } 

            if (elementIsCheckboxField(child)) {
                const fieldId = child.props.name;

                const props = {
                    defaultChecked: child.props.defaultChecked,
                    onChange: handles.checkboxChange(child.props.onChange),
                    "aria-invalid": !state[fieldId].valid,
                    "aria-errormessage": fieldId + "-errormessage"
                };

                return cloneElement(child, props);
            } 

            if (elementIsSelectField(child)) {
                const fieldId = child.props.name;

                const props = {
                    onChange: handles.selectChange(child.props.onChange),
                    defaultValue: child.props.defaultValue,
                    "aria-invalid": !state[fieldId].valid,
                    "aria-errormessage": fieldId + "-errormessage"
                };
                return cloneElement(child, props);
            }

            if (elementIsColorField(child)) {
                const props = {
                    onChange: handles.colorChange(child.props.onChange),
                    defaultValue: child.props.defaultValue,
                };
                return cloneElement(child, props);
            }

            if (elementIsTextField(child)) {
                const fieldId = child.props.name;

                const props = {
                    onChange: handles.inputChange(child.props.onChange),
                    onBlur: handles.inputBlur(child.props.onBlur),
                    defaultValue: child.props.defaultValue,
                    "aria-invalid": !state[fieldId].valid,
                    "aria-errormessage": fieldId + "-errormessage"
                };
                return cloneElement(child, props);
            }

        } 


        if (elementIsErrorMessage(child)) {
            const fieldId = child.props["data-errorfor"];
            const props = {
                id: fieldId + "-errormessage",
                role: "alert"
            };
            return cloneElement(child, props, state[fieldId].errorMessage);
        } 


        if (elementHasChildren(child)) { 
            const grandChildren = addPropsToChildren(child.props.children, state, handles);
            return cloneElement(child, {}, grandChildren);
        }

        return child;
    });

};
