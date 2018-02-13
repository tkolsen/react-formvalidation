import React, {Component} from "react";
import {func, object} from 'prop-types';
import update from "immutability-helper";

import getErrorMessage from "./getErrorMessage";
import {addPropsToChildren} from "./addpropstochildren";
import {addCustomValidation, generateInitialState, toMap, toObject} from "./helpers"


class FormValidated extends Component {

    state = generateInitialState(this.props.children);

    static propTypes = {
        onSubmit: func.isRequired,
        onBlur: object,
        onChange: object,
        customValidation: object,
        formRef: func
    };

    static defaultProps = {
        onBlur: {},
        onChange: {},
        customValidation: {}
    };

    updateField = (fieldId, newState) => {
        this.setState(prevState =>
            update(prevState, {
                fields: {[fieldId]: {$merge: newState}}
            })
        );
    };

    validateField = (fieldId, field) => {
        return addCustomValidation(fieldId, field, this.props.customValidation)
            .then(field => {
                this.updateField(fieldId, {
                    valid: field.validity.valid,
                    errorMessage: getErrorMessage(field)
                });
                return field.validity.valid;
            })
    };

    submitForm = e => {
        e.preventDefault();

        const formElements = e.target.elements;
        const fieldList = Object.keys(this.state.fields);

        let dataFields = [];
        for (let i = 0; i < formElements.length; i++) {
            if (fieldList.indexOf(formElements[i].name) > -1) {
                dataFields.push(formElements[i]);
            }
        }

        let isValid = true;

        const validations = dataFields.map(field => {
            return this.validateField(field.name, field)
                .then(valid => {
                    if (!valid) {
                        isValid = false;
                    }
                });
        });

        Promise.all(validations)
            .then(() => {
                if (isValid) {
                    let values = {};

                    for (let i = 0; i < dataFields.length; i++) {
                        const {name, value, type, checked} = dataFields[i];
                        if (!["submit", "reset", "button"].includes(type)) {
                            if(type === "checkbox"){
                                if(!values[name]){
                                    values[name] = []
                                }
                                if(checked) values[name].push(value);
                                else console.error("Checkbox element is missing value prop. All checkbox elements in form must have value prop set.", formElements[i]);
                            }
                            else if(type === "radio"){
                                if(checked){
                                    values[name] = value;
                                }
                            }
                            else values[name] = value;
                        }
                    }
                    this.props.onSubmit(values);
                }
            })
    };


    inputChange = onChange => e => {
        const field = e.target;
        if (!this.state.fields[field.name].valid) {
            this.validateField(field.name, field);
        }
        if (onChange) {
            onChange(e)
        }
    };

    inputBlur = onBlur => e => {
        const field = e.target;
        this.validateField(field.name, field);
        if (onBlur) onBlur(e)
    };

    radioChange = onChange => e => {
        const field = e.target;
        this.validateField(field.name, field);
        if (onChange) onChange(e)
    };

    selectChange = onChange => e => {
        const field = e.target;
        if (!this.state.fields[field.name].valid) {
            this.validateField(field.name, field);
        }
        if (onChange) onChange(e);
    };

    colorChange = onChange => e => {
        const field = e.target;
        if (!this.state.fields[field.name].valid) {
            this.validateField(field.name, field);
        }
        if (onChange) onChange(e);
    };

    checkboxChange = onChange => e => {
        const field = e.target;
        this.validateField(field.name, field);
        if (onChange) onChange(e);
    };


    handles = {
        checkboxChange: this.checkboxChange,
        colorChange: this.colorChange,
        inputBlur: this.inputBlur,
        inputChange: this.inputChange,
        radioChange: this.radioChange,
        selectChange: this.selectChange
    };




    componentWillReceiveProps(nextProps){
        if(!this.state) return;
        let updatedFieldList = generateInitialState(nextProps.children);
        let newFields = Object.keys(updatedFieldList.fields).reduce((result, key)=>{
            if(!Object.keys(this.state.fields).includes(key)){
                result[key] = updatedFieldList.fields[key];
            }
            return result;
        }, {});


        const newState = update(this.state, {
            fields: {$merge: newFields}
        });

        let removedFields = Object.keys(newState.fields).reduce((result, key)=>{
            if(!Object.keys(updatedFieldList.fields).includes(key)){
                result.push(key);
            }
            return result;
        }, []);

        const newState2 = update(newState, {
            fields: {$unset: removedFields}
        });

        this.setState(newState2)
    }


    render() {


        return (
            <form onSubmit={this.submitForm} ref={this.props.formRef} noValidate>
                {addPropsToChildren(this.props.children, this.state.fields, this.handles, false)}
            </form>
        );


    }
}

export default FormValidated;
