import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all polls
  const fetchPolls = async () => {
    try {
      const response = await fetch('http://192.168.56.1:3000/api/polls');
      if (!response.ok) throw new Error('Failed to fetch polls');

      const data = await response.json();
      setPolls(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Failed to load polls.');
    }
  };

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={polls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pollContainer}>
            <Text style={styles.pollQuestion}>{item.question}</Text>

            {/* Vote Now Button */}
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => navigation.navigate('Vote', { pollId: item.id })}
            >
              <Text style={styles.voteText}>Vote Now</Text>
            </TouchableOpacity>

            {/* View Results Button */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('PollDetails', { pollId: item.id })}
            >
              <Text style={styles.detailsText}>View Results</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Create Poll Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePoll')}
      >
        <Text style={styles.createText}>+ Create Poll</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pollContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  pollQuestion: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },

  voteButton: { padding: 10, backgroundColor: '#28a745', marginBottom: 5 },
  voteText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },

  detailsButton: { padding: 10, backgroundColor: '#007bff', marginTop: 10 },
  detailsText: { color: 'white', textAlign: 'center' },

  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  createButton: { padding: 15, backgroundColor: '#28a745', marginTop: 20 },
  createText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});

export default HomeScreen;
