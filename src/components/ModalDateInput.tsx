import * as React from 'react'
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, KeyboardTypeOptions } from 'react-native';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autobind from 'autobind-decorator';
import Header from './Header';
import { commonStyles } from './commonStyles';
import Button from './Button';
import DateTimePicker from "react-native-modal-datetime-picker";
import Icon from './Icon';



type DateChangedEvent =  (value: Date)=> void;

type ModaleDateInputProps = {
    label?: string
    date?: Date
    placeholder?: string
    onDateChanged?: DateChangedEvent
    style?: any
    disabled?: Boolean
    mode?: "date" | "time"
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14, 
        color: 'rgb(120, 120, 120)', 
        marginBottom: 6
    }, 

    value: {
        fontSize: 18,
        lineHeight: 22,
        color: 'black',
    },

    placeholder: {
        fontSize: 18, 
        lineHeight: 22,
        color: 'rgb(180, 180, 180)',
    },

    valueContainer: {
        flexDirection: 'row'
    },

    textInput: {
        fontSize: 18,
        lineHeight: 22,
        borderBottomWidth: 2, 
        borderStyle: 'solid',
        borderColor: 'black',
        color: 'black'
    },
})


@observer
export default class ModaleDateInput extends React.Component<ModaleDateInputProps> {

    @observable
    modalOpen = false;

    static defaultProps = {
        mode: 'date'
    };


    @autobind
    openModal() {

        if(this.props.disabled) {
            return;
        }

        this.modalOpen = true;
    }


    @autobind
    handleDatePicked(date: Date) {
        this.modalOpen = false;
        if(this.props.onDateChanged) {
            this.props.onDateChanged(date);
        }
    }

    @autobind
    hideDateTimePicker() {
        this.modalOpen = false;
    }

    dateToString(): string {
        if(this.props.date) {
            return this.props.mode == 'date'? this.props.date.toDateString(): 

                this.props.date.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true })
        }
        return this.props.placeholder;
    }
   

    render() {

        var text = this.dateToString();
        var textStyle = this.props.date? styles.value : styles.placeholder;
        var icon = this.props.mode == 'date'? 'calendar': 'clock' 

        return (
            <TouchableOpacity style={this.props.style} onPress={this.openModal}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon icon={icon} size={20} style={{marginRight: 12}}/>
                    <View>
                        <Text style={styles.label}> {this.props.label} </Text>
                        <View style={styles.valueContainer}>
                            <Text style={textStyle}> {text} </Text>
                        </View>
                    </View>
                </View>

                <DateTimePicker
                    isVisible={this.modalOpen}
                    onConfirm={this.handleDatePicked}
                    onCancel={this.hideDateTimePicker}
                    mode={this.props.mode}
                    is24Hour={false}
                />
            </TouchableOpacity>
        )
    }
}




