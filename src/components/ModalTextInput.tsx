import * as React from 'react'
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, KeyboardTypeOptions } from 'react-native';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import autobind from 'autobind-decorator';
import Header from './Header';
import { commonStyles } from './commonStyles';
import Button from './Button';


type TextChangedEventArgs =  (value: string)=> void;

type ModalTextInputProps = {
    label?: string
    text?: string
    placeholder?: string
    onTextChanged?: TextChangedEventArgs
    style?: any
    multiline?: boolean
    keyboardType?: KeyboardTypeOptions
    disabled?: Boolean
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
export default class ModalTextInput extends React.Component<ModalTextInputProps> {

    @observable
    modalOpen = false;

    @observable 
    text = ""

    @autobind
    openModal() {

        if(this.props.disabled) {
            return;
        }

        this.modalOpen = true;
        this.text = this.props.text;
    }

    @autobind
    closeModal() {
        this.modalOpen = false;
    }

    @autobind
    saveAndCloseModal() {
        this.modalOpen = false;
        if(this.props.onTextChanged && this.text != this.props.text) {
            this.props.onTextChanged(this.text);
        }
    }

    getModalContent() {
        return (
            <View style={commonStyles.topContainer}>
                <Header theme="white" icon="back_black" iconClick={this.closeModal}/>
                <View style={{paddingLeft: 18, paddingRight: 18, paddingTop: 12}}>
                    <Text style={styles.label}> {this.props.label} </Text>
                    <TextInput placeholder={this.props.placeholder} value={this.text} 
                        onChangeText={it=> this.text = it} style={styles.textInput} 
                        multiline={this.props.multiline || false} keyboardType={this.props.keyboardType || 'default'}/>
                    <View style={{alignItems: 'center', width: '100%'}}>
                        <Button onClick={this.saveAndCloseModal} text="SAVE" style={{marginTop: 42, width: 220}}/>
                    </View>
                </View>
            </View>
        )
    }

    render() {

        var text = this.props.text || this.props.placeholder;
        var textStyle = this.props.text? styles.value : styles.placeholder;

        return (
            <TouchableOpacity style={this.props.style} onPress={this.openModal}>
                <Text style={styles.label}> {this.props.label} </Text>
                <View style={styles.valueContainer}>
                    <Text style={textStyle}> {text} </Text>
                </View>

                <Modal animationType="slide" transparent={false} visible={this.modalOpen}>
                    {this.getModalContent()}
                </Modal>
            </TouchableOpacity>
        )
    }
}




