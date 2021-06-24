import * as React from "react";
import autobind from "autobind-decorator";
import TopTabs, { TopTabsState } from "../components/TopTabs";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { commonStyles } from "../components/commonStyles";
import Header from "../components/Header";
import ContentBlock from "../components/ContentBlock";
import ModalTextInput from "../components/ModalTextInput";
import ImagePicker from "../components/ImagePicker";
import { observer, inject } from "mobx-react";
import ModalPreferencesSelect from "../components/ModalPreferencesSelect";
import LoginService from "../service/LoginService";
import Button from "../components/Button";
import { RouterStore } from "mobx-react-router";
import BottomTabs, {
  bottomTabsState,
  content
} from "./../components/BottomTabs";
import ImageResizer from "react-native-image-resizer";
var RNFS = require("react-native-fs");

var styles = StyleSheet.create({
  imagePicker: {
    marginTop: 12
  },

  textInput: {
    marginTop: 36
  },

  textInputFirst: {
    marginTop: 24
  },

  prefsSelect: {
    marginTop: 24,
    marginLeft: 8
  }
});

var topTabsState = new TopTabsState();

type ProfilePageProps = {
  login?: LoginService;
  routing?: RouterStore;
};

@inject("login")
@inject("routing")
@observer
export default class ProfilePage extends React.Component<ProfilePageProps> {
  @autobind
  resizeAndupload(uri: string) {
    ImageResizer.createResizedImage(uri, 512, 512, "JPEG", 90)
      .then(response => {
        RNFS.readFile(response.uri, "base64")
          .then(res =>
            this.props.login.setProfilePicture(`data:image/jpeg;base64,${res}`)
          )
          .catch(err => console.log(`err34`, err));
        return;
      })
      .catch(err => {
        console.log(`err`, err);
      });
  }

  @autobind
  goToMain() {
    this.props.routing.replace("/");
  }

  renderMyCar() {
    return (
      <ContentBlock
        style={{ paddingLeft: 18, paddingTop: 12, paddingRight: 18 }}
        hidden={topTabsState.currentTab != 1}
      >
        <ImagePicker
          style={styles.imagePicker}
          source={this.props.login.vehiclePicture}
          onImageLoaded={it => this.props.login.setVehiclePicture(it)}
        />
        <View style={{ ...commonStyles.separator, marginTop: 24 }} />

        <ModalTextInput
          label="Model Name"
          placeholder="Enter Your Model Name"
          style={styles.textInputFirst}
          text={this.props.login.modelName}
          onTextChanged={it => this.props.login.setModelName(it)}
        />

        <ModalTextInput
          label="Year"
          placeholder="Enter Your registration Year"
          style={styles.textInput}
          text={this.props.login.year}
          onTextChanged={it => this.props.login.setYear(it)}
          keyboardType="number-pad"
        />

        <ModalTextInput
          label="Registration Number"
          placeholder="Enter Your Registration Number"
          style={styles.textInput}
          text={this.props.login.registration}
          onTextChanged={it => this.props.login.setRegistration(it)}
        />

        <ModalTextInput
          label="Color"
          placeholder="Enter your Vehicle Color"
          style={styles.textInput}
          text={this.props.login.color}
          onTextChanged={it => this.props.login.setColor(it)}
        />

        <ModalTextInput
          label="Mileage"
          placeholder="Enter your Vehicle Mileage"
          style={styles.textInput}
          text={this.props.login.mileage}
          onTextChanged={it => this.props.login.setMileage(it)}
          keyboardType="number-pad"
        />

        <View style={{ height: 80 }} />
      </ContentBlock>
    );
  }

  renderAboutMe() {
    return (
      <ContentBlock
        style={{ paddingLeft: 18, paddingTop: 12, paddingRight: 18 }}
        hidden={topTabsState.currentTab != 0}
      >
        <ImagePicker
          style={styles.imagePicker}
          source={this.props.login.profilePicture}
          onImageLoaded={it => this.resizeAndupload(it)}
        />
        <View style={{ ...commonStyles.separator, marginTop: 24 }} />
        <ModalTextInput
          label="First Name"
          placeholder="Enter Your First Name"
          style={styles.textInputFirst}
          text={this.props.login.firstName}
          onTextChanged={it => this.props.login.setFirstName(it)}
        />

        <ModalTextInput
          label="Last Name"
          placeholder="Enter Your Last Name"
          style={styles.textInput}
          text={this.props.login.lastName}
          onTextChanged={it => this.props.login.setLastName(it)}
        />

        <ModalTextInput
          label="About Me"
          placeholder="Enter Your Mini Bio"
          style={styles.textInput}
          multiline={true}
          text={this.props.login.aboutMe}
          onTextChanged={it => this.props.login.setAboutMe(it)}
        />

        <ModalPreferencesSelect
          style={styles.prefsSelect}
          preferences={this.props.login.preferences}
          onPreferencesChanged={it => this.props.login.setPreferences(it)}
        />

        <ModalTextInput
          label="Phone Number"
          style={styles.textInput}
          disabled={true}
          text={this.props.login.user ? this.props.login.user.phoneNumber : ""}
        />

        <View style={{ alignItems: "center", width: "100%" }}>
          <Button
            onClick={() => this.props.login.signOut()}
            text="SIGN OUT"
            style={{ marginTop: 32, width: 220 }}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            width: "100%",
            flexDirection: "row",
            marginTop: 10,
            justifyContent: "center"
          }}
        >
          <Text style={{ fontSize: 14 }}>Read </Text>
          <TouchableOpacity
            onPress={() => this.props.routing.push("/terms")}
          >
            <Text
              style={{ color: "#000", backgroundColor: "#ccc", fontSize: 12 }}
            >
              Terms and Conditions
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14 }}> / </Text>
          <TouchableOpacity
            onPress={() => this.props.routing.push("/privacy")}
          >
            <Text
              style={{ color: "#000", backgroundColor: "#ccc", fontSize: 12 }}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 90 }} />
      </ContentBlock>
    );
  }

  render() {
    return (
      <View style={commonStyles.topContainer}>
        <Header title="My Profile" iconClick={this.goToMain} />
        <TopTabs state={topTabsState} content={["ABOUT ME", "MY CAR"]} />

        {this.renderAboutMe()}
        {this.renderMyCar()}
        <BottomTabs state={bottomTabsState} content={content} />
      </View>
    );
  }
}
