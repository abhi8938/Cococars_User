/* @flow */

import * as React from 'react'
import { RouterStore } from 'mobx-react-router';
import Header from '../components/Header';
import { observer, inject } from "mobx-react";
import autobind from "autobind-decorator";
import PDFView from 'react-native-view-pdf';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

type termsProps = {
    routing?: RouterStore

}

const resources = {
  url: 'https://cococars-firebase.firebaseapp.com/static/media/Coco%20Cars%20Terms%20and%20Conditions.df7c7321.pdf'
};

@inject('routing')
@observer
export default class Terms extends React.Component<termsProps> {
@autobind
  goBack() {
      this.props.routing.goBack()
  }
  render() {
    const resourceType = 'url'
    return (
      <View style={styles.container}>
      <Header theme="black" icon="back" iconClick={this.goBack} title="Terms and Services" />
             <PDFView
               fadeInDuration={250.0}
               style={{ flex: 1 }}
               resource={resources[resourceType]}
               resourceType={resourceType}
               onLoad={() => console.log(`PDF rendered from ${resourceType}`)}
               onError={(error) => console.log('Cannot render PDF', error)}
             />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
