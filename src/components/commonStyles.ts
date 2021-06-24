import { StyleSheet } from 'react-native';


export const commonStyles = StyleSheet.create({


    fillParent: {
        width: '100%',
        height: '100%', 
        position: 'absolute',
        left: 0, 
        top: 0
    },

    hidden: {
        display: 'none'
    },


   
    
    centeredBlock: {
        flexDirection: 'column', 
        alignItems: 'center',
        marginTop: 12
    }, 

    headline: {
        fontSize: 24,
        marginBottom: 24,
        marginTop: 12, 
    }, 

    subHeadline: {
        fontSize: 12,
        marginBottom: 8,
        marginTop: 12, 
        textAlign: 'center'
    }, 

    separator: {
        borderColor: 'rgba(0, 0, 0, 0.1)', 
        borderBottomWidth: 1, 
        borderStyle: 'solid',
        width: '100%', 
        maxWidth: 360,
    }, 

    topContainer: {
        width: '100%', 
        height: '100%',
        flexDirection: 'column', 
        backgroundColor: 'rgb(240, 240, 240)'
    }, 

    practiceButtonRow: {
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        marginBottom: 12,
        marginRight: 12
    }, 
    
    verticalFlex: {
        width: '100%', 
        flexGrow: 1
    }
})
