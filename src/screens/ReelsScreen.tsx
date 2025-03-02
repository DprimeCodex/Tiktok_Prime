import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Text,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';

// Import local images
import playIcon from '../assets/play.png';
import heartIcon from '../assets/icons/heart.png';
import commentIcon from '../assets/icons/comment.png';
import bookmarkIcon from '../assets/icons/bookmark.png';
import shareIcon from '../assets/icons/share.png';

// Get device dimensions accounting for status bar and navigation bar
const { height: screenHeight, width } = Dimensions.get('window');
const statusBarHeight = StatusBar.currentHeight || 0;
const bottomNavHeight = Platform.OS === 'ios' ? 83 : 65; // Adjust based on your tab navigator height

// Calculate actual usable height for videos
const videoHeight = screenHeight - bottomNavHeight;

const API_URL = 'http://10.0.2.2:5000/videos'; // Your local API endpoint

const ReelsScreen = () => {
  const videoRefs = useRef<Array<Video | null>>([]);
  const flatListRef = useRef<FlatList<any>>(null);

  const [videos, setVideos] = useState<string[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState<boolean[]>([]);
  const [page, setPage] = useState(1);

  const fetchVideos = async (newPage = 1, append = false) => {
    try {
      if (append) setIsFetchingMore(true);

      const response = await fetch(`${API_URL}?page=${newPage}`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Filter out duplicate videos
        const filteredData = data.filter(videoUrl => !videos.includes(videoUrl));
        
        if (filteredData.length === 0) {
          // If all videos were filtered out as duplicates, try fetching the next page
          if (hasMoreVideos) {
            setPage(newPage + 1);
            fetchVideos(newPage + 1, append);
          } else {
            setHasMoreVideos(false);
          }
          setIsFetchingMore(false);
          return;
        }

        // Update videos list with filtered data
        setVideos(prevVideos => {
          const updatedVideos = append ? [...prevVideos, ...filteredData] : filteredData;
          
          // Update playing and loading arrays to match the new videos array length
          const newLength = updatedVideos.length;
          setIsPlaying(prev => {
            const newArray = new Array(newLength).fill(false);
            if (currentIndex < newLength) {
              newArray[currentIndex] = true;
            }
            return newArray;
          });
          setIsLoading(new Array(newLength).fill(true));
          
          return updatedVideos;
        });
        
        setPage(newPage);
      } else {
        setHasMoreVideos(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load videos');
      console.warn('API Fetch Error:', error);
    } finally {
      setIsLoadingVideos(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMoreVideos) {
      fetchVideos(page + 1, true);
    }
  };

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentIndex(visibleIndex);
      
      // Pause all videos except the current one
      setIsPlaying(prev => {
        const newArray = new Array(prev.length).fill(false);
        newArray[visibleIndex] = true;
        return newArray;
      });
    }
  }, []);

  const handleBuffer = (index: number, isBuffering: boolean) => {
    setIsLoading(prev => {
      const updatedLoading = [...prev];
      updatedLoading[index] = isBuffering;
      return updatedLoading;
    });
  };

  const handleVideoLoad = (index: number) => {
    setIsLoading(prev => {
      const updatedLoading = [...prev];
      updatedLoading[index] = false;
      return updatedLoading;
    });
  };

  const togglePlayPause = (index: number) => {
    setIsPlaying(prev => {
      const newArray = [...prev];
      newArray[index] = !newArray[index];
      return newArray;
    });
  };

  if (isLoadingVideos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        data={videos}
        pagingEnabled
        snapToInterval={videoHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.videoContainer, { height: videoHeight }]}>
            <TouchableOpacity
              style={styles.videoOverlay}
              activeOpacity={0.8}
              onPress={() => togglePlayPause(index)}
            >
              <Video
                source={{ uri: item }}
                ref={ref => (videoRefs.current[index] = ref)}
                style={styles.video}
                resizeMode="cover"
                repeat
                paused={!isPlaying[index]}
                onLoad={() => handleVideoLoad(index)}
                onBuffer={(e) => handleBuffer(index, e.isBuffering)}
                onError={(error) => console.error('Video Error:', error)}
              />

              {/* Loading Indicator */}
              {isLoading[index] && (
                <ActivityIndicator size="large" color="white" style={styles.loader} />
              )}

              {/* Play Button Overlay */}
              {!isPlaying[index] && (
                <Image source={playIcon} style={styles.playIcon} />
              )}

              {/* Right-side Buttons */}
              <View style={styles.rightContainer}>
                <TouchableOpacity style={styles.iconContainer}>
                  <Image source={heartIcon} style={styles.icon} />
                  <Text style={styles.iconText}>26.8K</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconContainer}>
                  <Image source={commentIcon} style={styles.icon} />
                  <Text style={styles.iconText}>67</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconContainer}>
                  <Image source={bookmarkIcon} style={styles.icon} />
                  <Text style={styles.iconText}>1,666</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconContainer}>
                  <Image source={shareIcon} style={styles.icon} />
                  <Text style={styles.iconText}>448</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Video Title & Description */}
              <View style={styles.bottomContainer}>
                <Text style={styles.videoTitle}>🙏 Monks Chanting 🙏</Text>
                <Text style={styles.videoDescription}>
                  Enjoy peaceful Buddhist chanting for meditation and relaxation. #monks #buddhism
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore && hasMoreVideos ? (
            <ActivityIndicator size="large" color="white" style={styles.footerLoader} />
          ) : null
        }
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 300,
        }}
        removeClippedSubviews={true}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black',
  },
  loadingContainer: { 
    flex: 1, 
    backgroundColor: 'black', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  videoContainer: {
    width: '100%',
    // Height is now dynamically set in the component
  },
  videoOverlay: { 
    width: '100%', 
    height: '100%',
    justifyContent: 'center',
  },
  video: { 
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  loader: { 
    alignSelf: 'center',
  },
  playIcon: { 
    alignSelf: 'center', 
    width: 60, 
    height: 60, 
  },
  rightContainer: { 
    position: 'absolute', 
    right: 10, 
    bottom: 20, 
    alignItems: 'center' 
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  icon: { 
    width: 40, 
    height: 40,
    marginBottom: 5,
  },
  iconText: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: 'center' 
  },
  bottomContainer: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    width: width - 100 
  },
  videoTitle: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  videoDescription: { 
    color: 'white', 
    fontSize: 14, 
    marginTop: 5 
  },
  footerLoader: { 
    marginVertical: 20 
  },
});

export default ReelsScreen;