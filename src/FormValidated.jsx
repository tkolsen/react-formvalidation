import React, {Component} from "react";
import {func, object} from 'prop-types';
import update from "immutability-helper";

import getErrorMessage from "./getErrorMessage";
import {addPropsToChildren} from "./addpropstochildren";
import {addCustomValidation, generateInitialState} from "./helpers"


class FormValidated extends Component {

    state = generateInitialState(this.props.children);

    static propTypes = {
        onSubmit: func.isRequired,
        onBlur: object,
        onChange: object,
        customValidation: object
    };

    static defaultProps = {
        onBlur: {},
        onChange: {},
        initialValues: {},
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

        let fields = [];
        for (let i = 0; i < formElements.length; i++) {
            if (fieldList.indexOf(formElements[i].id) > -1) {
                fields.push(formElements[i]);
            }
        }

        let isValid = true;

        const validations = fields.map(field => {
            return this.validateField(field.id, field)
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

                    for (let i = 0; i < formElements.length; i++) {
                        const {id, value, type} = formElements[i];
                        if (!["submit", "reset", "button"].includes(type)) {
                            values[id] = value;
                        }
                    }
                    this.props.onSubmit(values);
                }
            })
    };


    inputChange = onChange => e => {
        const field = e.target;
        if (!this.state.fields[field.id].valid) {
            this.validateField(field.id, field);
        }
        if (onChange) {
            onChange(e)
        }
    };

    inputBlur = onBlur => e => {
        const field = e.target;
        this.validateField(field.id, field);
        if (onBlur) onBlur(e)
    };

    radioChange = onChange => e => {
        const field = e.target;
        this.validateField(field.name, field);
        if (onChange) onChange(e)
    };

    selectChange = onChange => e => {
        const field = e.target;
        if (!this.state.fields[field.id].valid) {
            this.validateField(field.id, field);
        }
        if (onChange) onChange(e);
    };

    colorChange = onChange => e => {
        const field = e.target;
        if (!this.state.fields[field.id].valid) {
            this.validateField(field.id, field);
        }
        if (onChange) onChange(e);
    };

    checkboxChange = onChange => e => {
        const field = e.target;
        this.validateField(field.id, field);
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


    render() {

        // TODO: Nå rendres hele skjemaet på nytt for hver endring i state. 
        // Kan dette optimaliseres?
        // State må endres pga. constraints
        // console.log('Remnder: ' + Date.now());
        // Kan flytte addPropsToChildren til ComponentWillMount. Referer til funksjon som henter state, 
        // i stedet for å hente verdien.


        return (
            <form onSubmit={this.submitForm} noValidate>
                {addPropsToChildren(this.props.children, this.state.fields, this.handles, false)}
            </form>
        );


    }
}

export default FormValidated;
