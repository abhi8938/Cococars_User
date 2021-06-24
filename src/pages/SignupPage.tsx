import * as React from 'react'
import autobind from 'autobind-decorator'
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { commonStyles } from '../components/commonStyles';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import Button from '../components/Button';
import { RouterStore } from 'mobx-react-router';
import LoaderOverlay from '../components/LoaderOverlay';
import LoginService from '../service/LoginService';
import { RNFirebase } from 'react-native-firebase';
import Header from '../components/Header';


const styles = StyleSheet.create({
    topPanel: {
        width: '100%',
        height: 420,
        top: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black'
    },

    logoContainer: {
        width: 140,
        height: 140,
        backgroundColor: 'white',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 12
    },

    logoText1: {
        fontSize: 38,
        lineHeight: 38,
        color: 'black'
    },

    logoText2: {
        fontSize: 20,
        lineHeight: 20,
        color: 'black'
    },

    bottomPanel: {
        flexGrow: 1,
        width: '100%',
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 22,
    },

    headline: {
        fontSize: 16
    },

    errorLine: {
        fontSize: 12,
        color: 'red',
        marginTop: 4
    },

    errorLineInvisible: {
        color: 'rgba(0, 0, 0, 0)'
    },

    textInput: {
        fontSize: 18,
        lineHeight: 22,
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: 'black',
        color: 'black',
        marginTop: 8
    },
    inner: {
        flexGrow: 1,
        justifyContent: "flex-end"
    },

    label: {
        fontSize: 14,
        color: 'rgb(120, 120, 120)',
        marginBottom: 6
    },
})

type SignupPageProps = {
    routing?: RouterStore
    login?: LoginService
}


@inject('routing')
@inject('login')
@observer
export default class SignupPage extends React.Component<SignupPageProps> {


    @observable
    verifyOtp = false;

    @observable
    error = "";

    @observable
    phoneNumber = ''

    @observable
    otp = ''

    @autobind
    async handleSignup() {
        try {
            await this.props.login.requestPhoneVerification(this.phoneNumber)
            this.verifyOtp = true;
            this.error = ""
        } catch (err) {
            console.log(`err`, err.message);
            if (err.code == 'auth/invalid-phone-number' || err.code == 'auth/missing-phone-number') {
                this.error = 'The phone number you entered is invalid.';
            } else {
                this.error = err.message
            }

        }
    }

    @autobind
    async finishSignup() {
        try {
            await this.props.login.completePhoneVerification(this.otp);
            this.error = "";
        } catch (err) {
            if(err.code == 'err auth/unknown'){
                this.error = `Code Confirm Error: ${err.message}`
            }
            console.log(`err`,err);
            this.error = 'The OTP you entered is invalid.';
        }
    }

    @autobind
    reset() {
        this.verifyOtp = false;
        this.error = "";
    }

    getErrorStyle() {
        return this.error == "" ? { ...styles.errorLine, ...styles.errorLineInvisible } : styles.errorLine;
    }


    renderEnterPhone() {
        return (
            <KeyboardAvoidingView style={commonStyles.fillParent} behavior={Platform.OS === "ios" ? "padding" : null} enabled>
                <View style={styles.inner}>
                    <View style={styles.topPanel} >
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText1}>COCO</Text>
                            <Text style={styles.logoText2}>cars</Text>
                        </View>
                    </View>

                    <View style={styles.bottomPanel}>
                        <Text style={styles.headline}>Get Started With Coco</Text>
                        <TextInput placeholder="Enter Your Phone Number" value={this.phoneNumber}
                            onChangeText={it => this.phoneNumber = it} style={styles.textInput}
                            keyboardType="phone-pad" />

                        <Text style={this.getErrorStyle()}>{this.error}</Text>

                        <View style={{ alignItems: 'center', width: '100%' }}>
                            <Button onClick={this.handleSignup} text="NEXT" style={{ marginTop: 32, width: 220 }} />
                        </View>
                    </View>
                    <View style={{ height: 32 }} />
                </View>
            </KeyboardAvoidingView>
        )
    }

    renderVerifyOtp() {

        return (
            <View style={commonStyles.topContainer}>
                <Header theme="white" icon="back_black" iconClick={this.reset} />
                <View style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 12 }}>
                    <Text style={styles.label}> Enter your OTP </Text>
                    <TextInput value={this.otp}
                        onChangeText={it => this.otp = it} style={styles.textInput}
                        keyboardType="number-pad" />

                    <Text style={this.getErrorStyle()}>{this.error}</Text>

                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <Button onClick={this.finishSignup} text="SIGN IN" style={{ marginTop: 42, width: 220 }} />
                    </View>
                </View>
            </View>
        )

    }

    render() {
        return this.verifyOtp ? this.renderVerifyOtp() : this.renderEnterPhone();
    }
}