// media.tsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity 
} from "react-native";
import { FIRESTORE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const MediaScreen1 = () => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    const fetchMedia = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        // Get all journal entries for the current user
        const journalsRef = collection(FIRESTORE_DB, "users", userId, "journals");
        const snapshot = await getDocs(journalsRef);
        const mediaList: any[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data.media && Array.isArray(data.media)) {
            data.media.forEach((item: any) => {
              // You can add extra fields if needed, e.g. journalId
              mediaList.push({ ...item, journalId: docSnapshot.id });
            });
          }
        });
        setMediaItems(mediaList);
      } catch (error) {
        console.error("Error fetching media: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [userId]);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const renderMediaItem = ({ item, index }: { item: any; index: number }) => {
    const { width } = Dimensions.get("window");
    const itemSize = (width - 40) / 2; // accounting for padding/margins
    return (
      <TouchableOpacity onPress={() => openModal(index)}>
        {item.type === "image" ? (
          <Image
            source={{ uri: item.url }}
            style={[styles.mediaItem, { width: itemSize, height: itemSize }]}
            resizeMode="cover"
          />
        ) : item.type === "video" ? (
          <View style={[styles.mediaItem, { width: itemSize, height: itemSize }]}>
            <Video
              source={{ uri: item.url }}
              style={styles.videoThumbnail}
              useNativeControls={false}
              resizeMode="cover"
              isLooping
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.videoText}>Video</Text>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderFullScreenMedia = () => {
    const currentItem = mediaItems[currentIndex];
    if (!currentItem) return null;
    return currentItem.type === "image" ? (
      <Image
        source={{ uri: currentItem.url }}
        style={styles.fullScreenMedia}
        resizeMode="contain"
      />
    ) : currentItem.type === "video" ? (
      <Video
        source={{ uri: currentItem.url }}
        style={styles.fullScreenMedia}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
    ) : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>My Media</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#008080" style={styles.loader} />
      ) : mediaItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No media uploaded yet.</Text>
        </View>
      ) : (
        <FlatList
          data={mediaItems}
          renderItem={renderMediaItem}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            {renderFullScreenMedia()}
          </View>
          {mediaItems.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity style={styles.leftArrow} onPress={goPrevious}>
                  <Ionicons name="arrow-back" size={40} color="white" />
                </TouchableOpacity>
              )}
              {currentIndex < mediaItems.length - 1 && (
                <TouchableOpacity style={styles.rightArrow} onPress={goNext}>
                  <Ionicons name="arrow-forward" size={40} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
    color: "#008080",
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  mediaItem: {
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  videoText: {
    color: "white",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenMedia: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  leftArrow: {
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -20,
    zIndex: 10,
  },
  rightArrow: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -20,
    zIndex: 10,
  },
});

export default MediaScreen1;
