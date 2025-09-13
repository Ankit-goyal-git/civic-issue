import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [formData, setFormData] = useState({
    issueType: '',
    title: '',
    description: '',
    location: '',
    locationSource: '', // 'gps', 'manual', or ''
    photo: null
  });
  const [submittedReports, setSubmittedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  
  // Authentication form data
  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Backend API URL - Using your computer's IP address
  const API_BASE_URL = 'http://192.168.42.83:5000/api';

  // Authentication functions
  const register = async () => {
    if (!authFormData.name || !authFormData.email || !authFormData.password) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting registration...');
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authFormData),
      });

      console.log('Registration response status:', response.status);
      const result = await response.json();
      console.log('Registration result:', result);
      
      if (response.ok) {
        setAuthToken(result.token);
        setUser(result.user);
        setCurrentScreen('home');
        Alert.alert('Success', 'Account created successfully!');
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', `Failed to create account: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. API URL is correct\n3. Network connection`);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authFormData.email || !authFormData.password) {
      Alert.alert('Missing Information', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authFormData.email,
          password: authFormData.password
        }),
      });

      console.log('Login response status:', response.status);
      const result = await response.json();
      console.log('Login result:', result);
      
      if (response.ok) {
        setAuthToken(result.token);
        setUser(result.user);
        setCurrentScreen('home');
        Alert.alert('Success', 'Login successful!');
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', `Failed to login: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. API URL is correct\n3. Network connection\n4. Email and password are correct`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setCurrentScreen('login');
    setSubmittedReports([]);
    Alert.alert('Logged Out', 'You have been logged out successfully');
  };


  // Add debug log function
  const addDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-4), logMessage]); // Keep last 5 logs
  };



  // Get location source indicator
  const getLocationSourceIndicator = (locationSource) => {
    switch (locationSource) {
      case 'gps':
        return '🛰️ GPS';
      case 'manual':
        return '✏️ Manual';
      default:
        return '❓ Unknown';
    }
  };

  // Fetch user's reports from backend
  const fetchReports = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports/my`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const reports = await response.json();
        setSubmittedReports(reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  // Load reports when component mounts
  useEffect(() => {
    fetchReports();
  }, []);

  // Refresh reports when track screen is opened
  useEffect(() => {
    if (currentScreen === 'track') {
      fetchReports();
    }
  }, [currentScreen]);

  // Camera function
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos. Please enable it in your device settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, photo: result.assets[0] });
        Alert.alert('Success', 'Photo captured successfully!');
      }
    } catch (error) {
      Alert.alert('Camera Error', `Failed to open camera: ${error.message}`);
    }
  };

  // Photo picker function (from gallery)
  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required to select photos. Please enable it in your device settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, photo: result.assets[0] });
        Alert.alert('Success', 'Photo selected successfully!');
      }
    } catch (error) {
      Alert.alert('Gallery Error', `Failed to open gallery: ${error.message}`);
    }
  };

  // Show photo options
  const showPhotoOptions = () => {
    const options = [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Gallery', onPress: pickPhoto },
    ];
    
    if (formData.photo) {
      options.push({ text: 'Remove Photo', onPress: () => {
        setFormData({ ...formData, photo: null });
      }});
    }
    
    options.push({ text: 'Cancel', style: 'cancel' });
    
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      options
    );
  };

  // Location function
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permission is required');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setFormData({ 
      ...formData, 
      location: `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`,
      locationSource: 'gps'
    });
  };

  // Submit form
  const submitReport = async () => {
    if (!formData.issueType || !formData.title || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    if (!formData.location) {
      Alert.alert('Location Required', 'Please enable location services and try again. Location is required for all reports.');
      return;
    }
    
    if (!formData.photo) {
      Alert.alert('Photo Required', 'Please take or select a photo. Photo is required for all reports.');
      return;
    }
    
    setLoading(true);
    addDebugLog('Starting report submission...');
    
    try {
      // Create form data for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('issueType', formData.issueType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location || 'Not provided');
      formDataToSend.append('locationSource', formData.locationSource || 'unknown');
      
      addDebugLog(`Form data prepared: ${formData.issueType} - ${formData.title}`);
      
      // Add photo if available
      if (formData.photo) {
        // Create proper file object for FormData
        const photoFile = {
          uri: formData.photo.uri,
          type: formData.photo.mimeType || 'image/jpeg',
          name: formData.photo.fileName || 'photo.jpg',
        };
        
        // Try different approaches for file upload
        try {
          formDataToSend.append('photo', photoFile);
          addDebugLog(`Photo added to form data: ${formData.photo.uri}`);
          addDebugLog(`Photo file object: ${JSON.stringify(photoFile)}`);
        } catch (fileError) {
          addDebugLog(`File append error: ${fileError.message}`);
          // Fallback: try without file extension
          const fallbackFile = {
            uri: formData.photo.uri,
            type: 'image/jpeg',
            name: 'photo.jpg',
          };
          formDataToSend.append('photo', fallbackFile);
          addDebugLog(`Using fallback file object`);
        }
      } else {
        addDebugLog('No photo to upload');
      }
      
      addDebugLog(`Sending POST request to: ${API_BASE_URL}/reports`);
      
      // Send to backend
      addDebugLog(`Attempting to connect to: ${API_BASE_URL}/reports`);
      
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        timeout: 30000, // 30 second timeout
      });
      
      addDebugLog(`Response received with status: ${response.status}`);
      const result = await response.json();
      addDebugLog(`Response data: ${JSON.stringify(result)}`);
      
      if (response.ok) {
        Alert.alert(
          'Report Submitted!', 
          `Your report has been submitted successfully!\n\nReport ID: #${result.report._id}\nStatus: ${result.report.status}`,
          [{ text: 'OK', onPress: () => setCurrentScreen('home') }]
        );
        
        // Refresh reports from backend
        await fetchReports();
        
        // Reset form
        setFormData({
          issueType: '',
          title: '',
          description: '',
          location: '',
          locationSource: '',
          photo: null
        });
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (error) {
      addDebugLog(`Error submitting report: ${error.message}`);
      console.error('Report submission error:', error);
      
      // If photo upload fails, try submitting without photo
      if (formData.photo) {
        addDebugLog('Attempting to submit without photo...');
        try {
          const formDataWithoutPhoto = new FormData();
          formDataWithoutPhoto.append('issueType', formData.issueType);
          formDataWithoutPhoto.append('title', formData.title);
          formDataWithoutPhoto.append('description', formData.description);
          formDataWithoutPhoto.append('location', formData.location || 'Not provided');
          formDataWithoutPhoto.append('locationSource', formData.locationSource || 'unknown');
          
          const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            body: formDataWithoutPhoto,
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            Alert.alert(
              'Report Submitted (Without Photo)', 
              `Your report has been submitted successfully!\n\nReport ID: #${result.report._id}\nStatus: ${result.report.status}\n\nNote: Photo upload failed, but report was saved.`,
              [{ text: 'OK', onPress: () => setCurrentScreen('home') }]
            );
            await fetchReports();
            setFormData({
              issueType: '',
              title: '',
              description: '',
              location: '',
              locationSource: '',
              photo: null
            });
            return;
          }
        } catch (retryError) {
          addDebugLog(`Retry without photo also failed: ${retryError.message}`);
        }
      }
      
      Alert.alert(
        'Submission Failed', 
        `Failed to submit report: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. You are logged in\n3. Network connection\n4. All required fields are filled`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      addDebugLog('Report submission process completed');
    }
  };

  const renderLoginScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Civic Issue Tracker</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={authFormData.email}
            onChangeText={(text) => setAuthFormData({ ...authFormData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={authFormData.password}
            onChangeText={(text) => setAuthFormData({ ...authFormData, password: text })}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={login}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('register')}
        >
          <Text style={styles.secondaryButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderRegisterScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Civic Issue Tracker</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={authFormData.name}
            onChangeText={(text) => setAuthFormData({ ...authFormData, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={authFormData.email}
            onChangeText={(text) => setAuthFormData({ ...authFormData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={authFormData.password}
            onChangeText={(text) => setAuthFormData({ ...authFormData, password: text })}
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={authFormData.phone}
            onChangeText={(text) => setAuthFormData({ ...authFormData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={register}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('login')}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderHomeScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Civic Issue Tracker</Text>
        <Text style={styles.subtitle}>Welcome, {user?.name || 'User'}!</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.issueTypes}>
        <Text style={styles.sectionTitle}>Report Issues Like:</Text>
        <View style={styles.issueGrid}>
          <View style={styles.issueCard}>
            <Text style={styles.issueEmoji}>🕳️</Text>
            <Text style={styles.issueText}>Potholes</Text>
          </View>
          <View style={styles.issueCard}>
            <Text style={styles.issueEmoji}>💡</Text>
            <Text style={styles.issueText}>Broken Lights</Text>
          </View>
          <View style={styles.issueCard}>
            <Text style={styles.issueEmoji}>🗑️</Text>
            <Text style={styles.issueText}>Trash Issues</Text>
          </View>
          <View style={styles.issueCard}>
            <Text style={styles.issueEmoji}>🚧</Text>
            <Text style={styles.issueText}>Road Damage</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setCurrentScreen('report')}
        >
          <Text style={styles.buttonText}>Report an Issue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('track')}
        >
          <Text style={styles.secondaryButtonText}>Track Reports</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );

  const renderReportScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Report Issue</Text>
        <Text style={styles.subtitle}>Help us fix problems</Text>
      </View>
      
      <View style={styles.form}>
        {/* Issue Type Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Issue Type *</Text>
          <View style={styles.issueTypeGrid}>
            {['Pothole', 'Broken Light', 'Trash', 'Road Damage', 'Water Leak'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.issueTypeButton,
                  formData.issueType === type && styles.issueTypeButtonSelected
                ]}
                onPress={() => setFormData({ ...formData, issueType: type })}
              >
                <Text style={[
                  styles.issueTypeText,
                  formData.issueType === type && styles.issueTypeTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of the issue"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        {/* Description Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description of the problem"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Location */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, styles.locationInput, !formData.location && styles.requiredField]}
              placeholder={formData.location ? "Enter address or coordinates" : "Location required - Tap 📍 to get current location"}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text, locationSource: 'manual' })}
            />
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Text style={styles.locationButtonText}>📍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Photo *</Text>
          <TouchableOpacity style={styles.photoButton} onPress={showPhotoOptions}>
            {formData.photo ? (
              <Image source={{ uri: formData.photo.uri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>📷 Add Photo (Required)</Text>
                <Text style={styles.photoPlaceholderSubtext}>Tap to take photo or select from gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={submitReport}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
        
        {/* Debug Logs */}
        {debugLogs.length > 0 && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Logs:</Text>
            {debugLogs.slice(0, 5).map((log, index) => (
              <Text key={index} style={styles.debugLog}>{log}</Text>
            ))}
            <TouchableOpacity 
              style={styles.testButton}
              onPress={testBackendConnection}
            >
              <Text style={styles.testButtonText}>Test Backend Connection</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#28a745', marginTop: 5 }]}
              onPress={async () => {
                addDebugLog('Testing report submission without photo...');
                try {
                  const testFormData = new FormData();
                  testFormData.append('issueType', 'Test');
                  testFormData.append('title', 'Test Report');
                  testFormData.append('description', 'This is a test report');
                  testFormData.append('location', 'Test Location');
                  
                  const response = await fetch(`${API_BASE_URL}/reports`, {
                    method: 'POST',
                    body: testFormData,
                    headers: { 'Accept': 'application/json' },
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    addDebugLog(`Test report submitted successfully: ${result.report._id}`);
                    Alert.alert('Success', 'Test report submitted successfully!');
                  } else {
                    addDebugLog(`Test report failed with status: ${response.status}`);
                  }
                } catch (error) {
                  addDebugLog(`Test report error: ${error.message}`);
                }
              }}
            >
              <Text style={styles.testButtonText}>Test Report Submission</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Extra spacing for system buttons */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );

  const renderTrackScreen = () => (
      <ScrollView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Track Reports</Text>
          <Text style={styles.subtitle}>See your report status</Text>
        </View>
      
      {submittedReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>📝 No Reports Yet</Text>
          <Text style={styles.emptyStateDesc}>
            You haven't submitted any reports yet.{'\n'}
            Go to "Report Issue" to submit your first report!
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('report')}
          >
            <Text style={styles.buttonText}>Submit First Report</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.reportsList}>
          {submittedReports.map((report) => (
            <View key={report._id || report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportId}>#{report._id ? report._id.slice(-6) : report.id}</Text>
                <View style={[styles.statusBadge, styles[`status${report.status.replace(' ', '')}`]]}>
                  <Text style={styles.statusText}>{report.status}</Text>
                </View>
              </View>
              
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportType}>{report.issueType}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
              
              <View style={styles.reportDetails}>
                <Text style={styles.reportDetail}>
                  📍 {report.location || 'Location not provided'}
                  {report.locationSource && (
                    <Text style={styles.locationSource}> ({getLocationSourceIndicator(report.locationSource)})</Text>
                  )}
                </Text>
                <Text style={styles.reportDetail}>📅 {new Date(report.submittedAt).toLocaleDateString()}</Text>
              </View>
              
              {report.photo && (
                <View style={styles.photoContainer}>
                  <Image 
                    source={{ uri: `http://192.168.42.83:5000/${report.photo.replace(/\\/g, '/')}` }} 
                    style={styles.reportPhoto} 
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
      
      {/* Extra spacing for system buttons */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {!authToken && currentScreen === 'login' && renderLoginScreen()}
      {!authToken && currentScreen === 'register' && renderRegisterScreen()}
      {authToken && currentScreen === 'home' && renderHomeScreen()}
      {authToken && currentScreen === 'report' && renderReportScreen()}
      {authToken && currentScreen === 'track' && renderTrackScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  screen: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  issueTypes: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  issueCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issueEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  issueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  buttons: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  comingSoon: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  comingSoonDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 30,
    marginBottom: 20,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 50,
  },
  // Debug Styles
  debugSection: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  debugLog: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  // Form Styles
  form: {
    marginTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  issueTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  issueTypeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  issueTypeButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  issueTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  issueTypeTextSelected: {
    color: 'white',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    fontSize: 20,
  },
  photoButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  requiredField: {
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  locationSource: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  // Tracking Styles
  emptyState: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyStateDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  reportsList: {
    marginTop: 20,
  },
  reportCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusInProgress: {
    backgroundColor: '#d1ecf1',
  },
  statusResolved: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reportType: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginBottom: 10,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  reportDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  reportDetail: {
    fontSize: 12,
    color: '#888',
  },
  photoContainer: {
    marginTop: 10,
  },
  reportPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
});
