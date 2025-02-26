import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, doc, getDoc, orderBy, onSnapshot } from 'firebase/firestore';

const CustomAppBar = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [journals, setJournals] = useState([]);
    const [filteredJournals, setFilteredJournals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('User');
    
    // Animations
    const [menuAnim] = useState(new Animated.Value(0));
    const [backdropAnim] = useState(new Animated.Value(0));
    
    const navigation = useNavigation();
    const user = FIREBASE_AUTH.currentUser;
    const userId = user?.uid;
    
    const toggleMenu = () => {
        if (menuVisible) {
            Animated.parallel([
                Animated.timing(menuAnim, { 
                    toValue: 0, 
                    duration: 300, 
                    useNativeDriver: true 
                }),
                Animated.timing(backdropAnim, { 
                    toValue: 0, 
                    duration: 300, 
                    useNativeDriver: true 
                })
            ]).start(() => setMenuVisible(false));
        } else {
            setMenuVisible(true);
            Animated.parallel([
                Animated.timing(menuAnim, { 
                    toValue: 1, 
                    duration: 300, 
                    useNativeDriver: true 
                }),
                Animated.timing(backdropAnim, { 
                    toValue: 1, 
                    duration: 300, 
                    useNativeDriver: true 
                })
            ]).start();
        }
    };

    useEffect(() => {
        let unsubscribe;

        const fetchJournals = () => {
            setLoading(true);
            try {
                const journalsCollectionRef = collection(FIRESTORE_DB, 'users', userId, 'journals');
                const q = query(journalsCollectionRef, orderBy('createdAt', 'desc'));

                unsubscribe = onSnapshot(
                    q,
                    (snapshot) => {
                        const fetchedJournals = [];
                        snapshot.forEach((doc) => {
                            fetchedJournals.push({ id: doc.id, ...doc.data() });
                        });
                        setJournals(fetchedJournals);
                        setFilteredJournals(fetchedJournals);
                        setLoading(false);
                    },
                    (error) => {
                        console.error('Error fetching journals:', error);
                        setLoading(false);
                    }
                );
            } catch (error) {
                console.error('Error setting up listener:', error);
                setLoading(false);
            }
        };

        if (userId) fetchJournals();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);

    useEffect(() => {
        const fetchUsername = async () => {
            if (userId) {
                try {
                    const userDocRef = doc(FIRESTORE_DB, 'users', userId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUsername(data.name || 'User');
                    }
                } catch (error) {
                    console.error('Error fetching username:', error);
                }
            }
        };

        fetchUsername();
    }, [userId]);

    const handleSettings = () => {
        toggleMenu();
        navigation.navigate('SettingsPage');
    };

    const handleSignOut = () => {
        toggleMenu();
        FIREBASE_AUTH.signOut()
            .then(() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }))
            .catch((error) => {
                console.error('Logout error:', error);
            });
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredJournals(journals);
        } else {
            const filtered = journals.filter(journal =>
                journal.text.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredJournals(filtered);
        }
    };

    // Menu animation translation
    const menuTranslateX = menuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 0],
    });

    const screenHeight = Dimensions.get('window').height;

    return (
        <View style={{ position: 'relative' }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
                    <MaterialCommunityIcons name="menu" size={24} color="white" />
                </TouchableOpacity>
                {!searchMode ? (
                    <Text style={styles.welcomeText}>Welcome, {username}!</Text>
                ) : (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Journals"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                    />
                )}
                <TouchableOpacity onPress={() => setSearchMode(!searchMode)} style={styles.iconButton}>
                    <MaterialCommunityIcons name={searchMode ? "close" : "magnify"} size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialCommunityIcons name="account" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {menuVisible && (
                <>
                    <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} onTouchEnd={toggleMenu} />
                    <Animated.View style={[styles.menuPanel, { transform: [{ translateX: menuTranslateX }], height: screenHeight }]}>
                        <View style={styles.userSection}>
                            <View style={styles.avatarCircle}>
                                <MaterialCommunityIcons name="account" size={32} color="white" />
                            </View>
                            <Text style={styles.userEmail}>{username}</Text>
                            <Text style={styles.userEmailSubtext}>{user?.email}</Text>
                        </View>
                        <ScrollView style={styles.menuItems}>
                            <TouchableOpacity onPress={handleSettings} style={styles.menuItem}>
                                <MaterialCommunityIcons name="cog" size={24} color="#4B5563" />
                                <Text style={styles.menuItemText}>Settings</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity onPress={handleSignOut} style={styles.menuItem}>
                                <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
                                <Text style={[styles.menuItemText, styles.logoutText]}>Sign Out</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </ScrollView>
                        <View style={styles.versionInfo}>
                            <Text style={styles.versionText}>Version 1.0.0</Text>
                        </View>
                    </Animated.View>
                </>
            )}

            {searchMode && (
                <View style={styles.searchResults}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0D9488" />
                    ) : (
                        <ScrollView style={{ maxHeight: 384 }}>
                            {filteredJournals.length > 0 ? (
                                filteredJournals.map((journal) => (
                                    <View key={journal.id} style={styles.journalCard}>
                                        <Text style={styles.journalText}>{journal.text}</Text>
                                        <Text style={styles.journalDate}>
                                            {new Date(journal.createdAt.seconds * 1000).toLocaleString()}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noResults}>No results found</Text>
                            )}
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = {
    header: {
        backgroundColor: '#0D9488',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
    },
    welcomeText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        fontSize: 16,
        color: '#1F2937',
    },
    divider: {
        width: 1,
        height: '60%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 8,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 40,
    },
    menuPanel: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 300,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 50,
    },
    userSection: {
        backgroundColor: '#0D9488',
        paddingVertical: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    userEmail: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmailSubtext: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    menuItems: {
        flex: 1,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingHorizontal: 24,
    },
    menuItemText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    logoutText: {
        color: '#EF4444',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 24,
    },
    versionInfo: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    versionText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
    },
    searchResults: {
        position: 'absolute',
        top: 64,
        left: 0,
        right: 0,
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 16,
        zIndex: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    journalCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    journalText: {
        fontSize: 16,
        color: '#1F2937',
    },
    journalDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    noResults: {
        textAlign: 'center',
        color: '#4B5563',
        fontSize: 16,
        marginTop: 16,
    },
};

export default CustomAppBar;
