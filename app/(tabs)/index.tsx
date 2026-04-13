import {
  getUserCompletionProgress,
  UserCompletionProgressEntity,
} from '@retroachievements/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Icon, List } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useConsoleImageUrls } from '@/contexts/ConsoleImageUrlContext';

interface Game extends UserCompletionProgressEntity {
  consoleIconUrl: string;
}

export default function GamesScreen() {
  const { authorization, isAuthenticated, username } = useAuth();
  const { consoleImageUrls } = useConsoleImageUrls();
  const [games, setGames] = useState<Game[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && authorization) {
      loadGames();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authorization]);

  const loadGames = async () => {
    try {
      const response = await getUserCompletionProgress(authorization, {
        username,
        offset: 0,
        count: 50,
      });
      const g = response.results as Game[];

      for (const game of g) {
        game.consoleIconUrl = consoleImageUrls.get(game.consoleId) || '';
      }
      // setGames(response.results);
      setGames(g);
      setTotalGames(response.total);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGames = async () => {
    if (games.length >= totalGames || loading) return;

    try {
      setLoading(true);
      const response = await getUserCompletionProgress(authorization, {
        username,
        offset: games.length,
        count: 50,
      });
      const g = response.results as Game[];
      for (const game of g) {
        game.consoleIconUrl = consoleImageUrls.get(game.consoleId) || '';
      }
      // setGames((prevGames) => [...prevGames, ...response.results]);
      setGames((prevGames) => [...prevGames, ...g]);
    } catch (error) {
      console.error('Error loading more games:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGame = ({ item }: { item: Game }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/game/${item.gameId}`)}
    >
      <Card.Content>
        <List.Item
          title={item.title}
          description={`${item.consoleName} - ${item.numAwarded}/${item.maxPossible} achievements`}
          left={() => <Icon source={{ uri: item.consoleIconUrl }} size={36} />}
        />
      </Card.Content>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type='title' style={styles.centerText}>
          Please set up your credentials in Settings
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type='title' style={styles.title}>
        Your Games
      </ThemedText>

      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => item.gameId.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadGames} />
        }
        onEndReached={loadMoreGames}
      />
      {loading && (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator size='large' />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: 12,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 8,
  },
  centerText: {
    textAlign: 'center',
    marginTop: 50,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
  },
});
