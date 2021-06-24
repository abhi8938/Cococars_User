import * as React from 'react'
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

interface ButtonProps {
    onClick?: ()=>void
    style?: any
    text?: string
    children?: string
}

const styles = StyleSheet.create({
    button: {
        fontSize: 14,
        lineHeight: 28,
        borderRadius: 4, 
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 4, 
        paddingBottom: 6,
        color: 'white', 
        backgroundColor: 'black',
        fontWeight:'900'
    }, 
})

export default class Button extends React.Component<ButtonProps> {

    render() {
        var buttonStyle = {...styles.button, ...this.props.style}; 
        var textStyle: any = {
            fontSize: buttonStyle.fontSize, 
            lineHeight: buttonStyle.lineHeight, 
            color: buttonStyle.color,
            textAlign: 'center'
        }

        var onClick = this.props.onClick || (() => {});

        return (
            <TouchableOpacity style={buttonStyle} onPress={onClick}>
                <Text style={[textStyle, {fontWeight:'500'}]}> {this.props.text || this.props.children} </Text>
            </TouchableOpacity>
        )
    }
}