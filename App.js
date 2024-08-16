import React, { useState } from 'react';
import { Image, PermissionsAndroid, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

const App = () => {

  const [filedata, setFileData] = useState('')
  const [ruri, setRuri] = useState('')
  const [compressed, setCompressed] = useState(false)
  const [compressionPercentage, setCompressionPercentage] = useState(0)
  const [resizedFileSize, setResizedFileSize] = useState('')

  const options = {
    noData: true
  }

  const selectFile = () => {
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User did not select an image.')
      }
      else if (response.error) {
        console.log("Error: ", response.error)
      }
      else {
        const fileInfo = response.assets[0]
        setFileData(fileInfo);
      }
    })
  }

  const compressImage = async () => {
    const resizedImage = await ImageResizer.createResizedImage(
      filedata.uri,
      filedata.width,
      filedata.height,
      "JPEG",
      parseInt(compressionPercentage)
    )
    const resizedImageUri = resizedImage.uri
    setResizedFileSize(resizedImage.size)
    const destinationPath = `${RNFS.PicturesDirectoryPath}/compressed-image-${Date.now()}.jpg`;
    await RNFS.moveFile(resizedImageUri, destinationPath)
    const granted = PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'App needs storage permission to store the compressed image.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      await RNFS.scanFile(destinationPath)
      console.log('File Saved.');
    }
    else {
      console.log("Permission Denied");
    }
    setRuri(destinationPath)
    setCompressed(true)
  }

  const shareImage = async () => {
    try {
      const shareOptions = {
        url: `file://${ruri}`
      }
      await Share.open(shareOptions)
    }
    catch (error) {
      console.log("Error: ", error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"#efeee9"} barStyle={'dark-content'} />
      <Pressable onPress={selectFile}>
        {filedata ? (
          <View>
            <Pressable onPress={()=>{setFileData(null);setCompressed(false)}}>
              <Text style={{fontSize: 30, marginBottom: 20, color: '#36454f'}}>◀︎</Text>
            </Pressable>
            <Image source={{ uri: filedata.uri }} style={{ width: 300, height: 300, borderRadius: 15 }} />
          </View>
        ) : (
          <View>
            <Text style={styles.heading}>Select an Image</Text>
            <View style={styles.addImage}></View>
          </View>
        )}
      </Pressable>
      {filedata && !compressed && (
        <View style={{ width: 250 }}>
          <Text style={{ color: '#36454f', marginTop: 10, fontSize: 16 }}>File Size: {Math.floor(filedata.fileSize / 1024)}KB</Text>
          <Text style={{ color: '#36454f', marginTop: 10, fontSize: 16 }}>Enter Quality Percentage: </Text>
          <TextInput style={styles.input} placeholder='Quality (0 - 100)' placeholderTextColor={'#efeee980'} value={compressionPercentage} onChangeText={setCompressionPercentage} keyboardType='numeric' />
          <Pressable style={styles.compress} onPress={compressImage}>
            <Text style={styles.compressText}>Compress It</Text>
          </Pressable>
        </View>
      )}
      {compressed && (
        <View style={{ width: '80%', alignItems: 'center' }}>
          <Text style={{ color: '#36454f', marginTop: 10, fontSize: 16 }}>File Size: {Math.floor(resizedFileSize / 1024)}KB</Text>
          <Text style={styles.uri}>{ruri}</Text>
          <Pressable style={styles.compress} onPress={shareImage}>
            <Text style={styles.compressText}>Share</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efeee9'
  },
  addImage: {
    width: 300,
    height: 300,
    backgroundColor: '#36454f4c',
    borderRadius: 15,
  },
  compress: {
    padding: 10,
    backgroundColor: '#36454f',
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center'
  },
  compressText: {
    color: "#efeee9",
    fontSize: 16
  },
  heading: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 15,
    color: '#36454f'
  },
  uri: {
    marginTop: 15,
    textAlign: 'center',
    width: '80%',
    color: '#36454f'
  },
  input: {
    height: 40,
    width: 120,
    backgroundColor: '#36454f',
    alignSelf: 'center',
    marginTop: 8,
    borderRadius: 10,
    padding: 10,
    color: '#efeee9'
  }
});

export default App;
