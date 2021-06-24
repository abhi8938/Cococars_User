/* @flow */

import * as React from "react";
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

type privacyProps = {
    routing?: RouterStore

}
const resources = {
  url: 'https://cococars-firebase.firebaseapp.com/static/media/Privacy%20Policy%20-%20Coco%20Cars.18f21f52.pdf'
};

@inject('routing')
@observer
export default class Privacy extends React.Component<privacyProps> {
  @autobind
  goBack() {
      this.props.routing.goBack()
  }
  render() {
    const resourceType = 'url'
    return (
      <View style={styles.container}>
      <Header theme="black" icon="back" iconClick={this.goBack} title="Add Ride" />
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
