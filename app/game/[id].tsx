import {
  GameExtendedAchievementEntityWithUserProgress,
  GameInfoAndUserProgress,
  getGameInfoAndUserProgress,
} from '@retroachievements/api';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Text } from 'react-native-paper';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const { authorization, isAuthenticated, username } = useAuth();
  const [gameInfo, setGameInfo] = useState<GameInfoAndUserProgress | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  const loadGameDetails = async () => {
    try {
      const response = await getGameInfoAndUserProgress(authorization, {
        gameId: parseInt(id as string),
        username,
      });
      setGameInfo(response);
    } catch (error) {
      console.error('Error loading game details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authorization && id) {
      loadGameDetails();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authorization, id]);

  const renderAchievement = (
    achievement: GameExtendedAchievementEntityWithUserProgress,
  ) => (
    <Card key={achievement.id} style={styles.achievementCard}>
      <Card.Content>
        <View style={styles.achievementHeader}>
          <Text variant='titleMedium' style={styles.achievementTitle}>
            {achievement.title}
          </Text>
          <Chip
            mode={achievement.dateEarned ? 'flat' : 'outlined'}
            style={
              achievement.dateEarned
                ? styles.achievedChip
                : styles.unachievedChip
            }
          >
            {achievement.dateEarned ? 'Achieved' : 'Locked'}
          </Chip>
        </View>
        <Text variant='bodyMedium' style={styles.achievementDescription}>
          {achievement.description}
        </Text>
        <View style={styles.achievementDetails}>
          <Text variant='bodySmall'>Points: {achievement.points}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <Text variant='headlineMedium' style={styles.centerText}>
          Authentication required
        </Text>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size='large' />
        <Text variant='bodyLarge' style={styles.loadingText}>
          Loading game details...
        </Text>
      </ThemedView>
    );
  }

  if (!gameInfo) {
    return (
      <ThemedView style={styles.container}>
        <Text variant='headlineMedium' style={styles.centerText}>
          Game not found
        </Text>
      </ThemedView>
    );
  }

  const achievements = Object.values(gameInfo.achievements);
  const achievedCount = achievements.filter((a) => a.dateEarned).length;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <Card style={styles.gameCard}>
          <Card.Content>
            <Image
              source={{
                uri: 'https://media.retroachievements.org' + gameInfo.imageIcon,
              }}
              height={100}
              width={100}
              style={{ borderRadius: 8 }}
            />

            <Text variant='headlineMedium' style={styles.gameTitle}>
              {gameInfo.title}
            </Text>

            <Text variant='titleMedium' style={styles.consoleName}>
              {gameInfo.consoleName}
            </Text>
            <View style={styles.gameStats}>
              <Chip mode='outlined'>
                {achievedCount}/{achievements.length} Achievements
              </Chip>
              <Chip mode='outlined'>
                {gameInfo.numDistinctPlayersCasual} Players
              </Chip>
            </View>
            <Text variant='bodyMedium' style={styles.gameInfo}>
              Publisher: {gameInfo.publisher}
            </Text>
            <Text variant='bodyMedium' style={styles.gameInfo}>
              Developer: {gameInfo.developer}
            </Text>
            <Text variant='bodyMedium' style={styles.gameInfo}>
              Genre: {gameInfo.genre}
            </Text>
            <Text variant='bodyMedium' style={styles.gameInfo}>
              Released: {new Date(gameInfo.released).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>

        <Text variant='headlineSmall' style={styles.achievementsTitle}>
          Achievements
        </Text>

        {achievements.map(renderAchievement)}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  gameCard: {
    marginBottom: 16,
  },
  gameTitle: {
    marginBottom: 8,
  },
  consoleName: {
    marginBottom: 16,
    color: '#666',
  },
  gameStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  gameInfo: {
    marginBottom: 4,
  },
  achievementsTitle: {
    marginBottom: 16,
  },
  achievementCard: {
    marginBottom: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementTitle: {
    flex: 1,
    marginRight: 8,
  },
  achievedChip: {
    backgroundColor: '#4CAF50',
  },
  unachievedChip: {
    backgroundColor: 'transparent',
  },
  achievementDescription: {
    marginBottom: 8,
  },
  achievementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
